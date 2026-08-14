import os
import uuid
from pathlib import Path
from datetime import datetime, timezone
import math
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
)
from reportlab.pdfgen import canvas

from app.core.config import settings
from app.models.observation import Observation
from app.models.monitoring_site import MonitoringSite
from app.models.user import User
from app.models.survey import Survey
from app.models.ai_analysis import AIAnalysis
from app.models.species_profile import SpeciesProfile

class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas renderer to print 'Page X of Y' footers
    and professional headers dynamically.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#475569")) # cool grey-slate
        
        # Suppress headers/footers on cover page
        if self._pageNumber > 1:
            # Header
            self.drawString(54, 750, "Wildlife Population Intelligence System - Ecological Report")
            self.setStrokeColor(colors.HexColor("#cbd5e1"))
            self.setLineWidth(0.5)
            self.line(54, 742, 558, 742)
            
            # Footer
            page_text = f"Page {self._pageNumber} of {page_count}"
            self.drawRightString(558, 40, page_text)
            self.drawString(54, 40, "CONFIDENTIAL - RESTRICTED CONSERVATION ECOLOGY DATABASE")
            self.line(54, 52, 558, 52)
            
        self.restoreState()

class ReportGeneratorService:
    def get_filtered_observations(
        self,
        db: Session,
        site_id: str = None,
        species: str = None,
        habitat: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> list:
        query = db.query(Observation)
        if site_id:
            query = query.filter(Observation.site_id == uuid.UUID(site_id))
        if species:
            query = query.filter(Observation.species.ilike(f"%{species}%"))
        if start_date:
            try:
                dt = datetime.strptime(start_date, "%Y-%m-%d")
                query = query.filter(Observation.observed_at >= dt)
            except Exception:
                pass
        if end_date:
            try:
                dt = datetime.strptime(end_date, "%Y-%m-%d")
                query = query.filter(Observation.observed_at <= dt)
            except Exception:
                pass
        if habitat:
            query = query.join(Observation.site).filter(MonitoringSite.habitat_type == habitat)
        if status:
            query = query.join(
                SpeciesProfile,
                (SpeciesProfile.common_name.ilike(Observation.species)) |
                (SpeciesProfile.scientific_name.ilike(Observation.species))
            ).filter(SpeciesProfile.conservation_status == status)
        return query.order_by(Observation.observed_at.desc()).all()

    def add_selected_filters_summary(
        self, 
        story: list, 
        body_style: any, 
        site_name: str = None, 
        species: str = None, 
        habitat: str = None, 
        status: str = None, 
        start_date: str = None, 
        end_date: str = None
    ):
        filter_text = []
        if site_name:
            filter_text.append(f"<b>Site:</b> {site_name}")
        if species:
            filter_text.append(f"<b>Species:</b> {species}")
        if habitat:
            filter_text.append(f"<b>Habitat:</b> {habitat}")
        if status:
            filter_text.append(f"<b>Threat Level:</b> {status}")
        if start_date or end_date:
            filter_text.append(f"<b>Date:</b> {start_date or 'N/A'} to {end_date or 'N/A'}")
            
        if not filter_text:
            filter_text.append("<b>Filters:</b> None (Unfiltered Global Report)")
            
        story.append(Paragraph(" | ".join(filter_text), ParagraphStyle("FilterText", parent=body_style, fontSize=8, textColor=colors.HexColor("#475569"))))
        story.append(Spacer(1, 10))

    def add_unified_metadata_summary(self, db: Session, story: list, styles: any, body_style: any):
        """
        Appends the required summary footer sections to every compiled PDF report.
        Includes: Population summary, Ecological summary, and Wildlife Health Score.
        """
        from app.services.ecological_service import ecological_service
        from app.services.population_service import population_service
        
        try:
            eco = ecological_service.generate_report(db)
            pop = population_service.analyze_population(db)
        except Exception:
            eco = {}
            pop = {}
            
        section_style = ParagraphStyle(
            "FootSec", 
            parent=styles["Heading2"], 
            fontName="Helvetica-Bold", 
            fontSize=12, 
            leading=15, 
            textColor=colors.HexColor("#0f172a"), 
            spaceBefore=15, 
            spaceAfter=6, 
            keepWithNext=True
        )
        
        story.append(Spacer(1, 10))
        story.append(Paragraph("SYSTEM INTELLIGENCE OVERVIEW DIGEST", section_style))
        
        grid_data = [
            [
                Paragraph("<b>Ecosystem Richness & Diversity</b>", body_style),
                Paragraph(f"Shannon Index: {eco.get('biodiversity_index', 0.0)}<br/>Richness: {eco.get('species_richness', 0)} species", body_style),
                Paragraph("<b>Wildlife Health Rating</b>", body_style),
                Paragraph(f"Score: {eco.get('wildlife_health_score', 0)}/100<br/>Status: {eco.get('wildlife_health_status', 'Healthy')}", body_style)
            ],
            [
                Paragraph("<b>Population Demographics</b>", body_style),
                Paragraph(f"Sighting Growth: +{pop.get('observation_growth', 0.0)}%<br/>Trend: {pop.get('population_trend', 'Stable')}", body_style),
                Paragraph("<b>Habitat Suitability</b>", body_style),
                Paragraph(f"Score: {eco.get('habitat_suitability_score', 0.0)}%<br/>Quality: {eco.get('habitat_quality', 'Good')}", body_style)
            ]
        ]
        
        t_foot = Table(grid_data, colWidths=[120, 130, 120, 130])
        t_foot.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#cbd5e1")),
            ('VALIGN', (0,0), (-1,-1), 'TOP')
        ]))
        story.append(t_foot)
        
        gen_time = datetime.now(timezone.utc).strftime("%d %B %Y %H:%M UTC")
        story.append(Spacer(1, 12))
        story.append(Paragraph(
            f"<i>Report compiled automatically on {gen_time} by Wildlife Intel Engine. Database version active.</i>", 
            ParagraphStyle("GenTime", parent=body_style, fontSize=7.5, textColor=colors.HexColor("#64748b"))
        ))

    def generate_report_by_id(
        self, 
        db: Session, 
        target_id: str,
        site_id: str = None,
        species: str = None,
        habitat: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> str:
        """
        Dispatches report compilation based on string target.
        Returns the static relative URL path to the generated PDF.
        """
        tid_lower = target_id.lower().strip()
        
        if tid_lower == "population":
            return self.generate_population_report(db, site_id, species, habitat, status, start_date, end_date)
        elif tid_lower == "ecology":
            return self.generate_ecology_report(db, site_id, species, habitat, status, start_date, end_date)
        elif tid_lower == "biodiversity":
            return self.generate_biodiversity_report(db, site_id, species, habitat, status, start_date, end_date)
        elif tid_lower == "survey":
            return self.generate_global_survey_report(db, site_id, start_date, end_date)
        elif tid_lower == "habitat":
            return self.generate_habitat_report(db, site_id, habitat)
        elif tid_lower == "conservation":
            return self.generate_conservation_report(db, status)
            
        try:
            parsed_id = uuid.UUID(target_id)
        except ValueError:
            raise ValueError(f"Invalid report target identifier: {target_id}")
            
        # Dispatch checks
        # 1. Check AIAnalysis
        analysis = db.query(AIAnalysis).filter(AIAnalysis.id == parsed_id).first()
        if analysis:
            return self.generate_pdf_report(db, parsed_id)
            
        # 2. Check Observation
        obs = db.query(Observation).filter(Observation.id == parsed_id).first()
        if obs:
            return self.generate_observation_report(db, parsed_id)
            
        # 3. Check Survey
        srv = db.query(Survey).filter(Survey.id == parsed_id).first()
        if srv:
            return self.generate_survey_report(db, parsed_id)
            
        raise ValueError(f"No database records found matching ID: {target_id}")

    def generate_pdf_report(self, db: Session, analysis_id: uuid.UUID) -> str:
        """
        Generates a professional PDF report for a specific AIAnalysis ID.
        """
        analysis = db.query(AIAnalysis).filter(AIAnalysis.id == analysis_id).first()
        if not analysis:
             raise ValueError("AI Analysis log entry not found")
             
        observation = analysis.observation
        site = observation.site if observation else None
        reporter = observation.reporter if observation else None
        
        profile = None
        primary_species = "Unknown"
        image_json = analysis.image_json or {}
        audio_json = analysis.audio_json or {}
        
        if image_json and image_json.get("detections"):
            primary_species = image_json["detections"][0]["species"]
        elif audio_json and audio_json.get("top_prediction"):
            primary_species = audio_json["top_prediction"]["common_name"]
        elif observation:
            primary_species = observation.species
            
        if primary_species != "Unknown":
            clean_lookup = primary_species.replace(" ", "_").strip()
            profile = db.query(SpeciesProfile).filter(
                (SpeciesProfile.scientific_name.ilike(f"%{clean_lookup}%")) |
                (SpeciesProfile.common_name.ilike(f"%{primary_species}%"))
            ).first()

        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = f"report_analysis_{analysis_id.hex}.pdf"
        pdf_path = reports_dir / pdf_filename
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        
        title_style = ParagraphStyle("CoverTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=24, leading=28, textColor=colors.HexColor("#065f46"), alignment=0, spaceAfter=15)
        section_style = ParagraphStyle("Sec", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=colors.HexColor("#0f172a"), spaceBefore=15, spaceAfter=8, keepWithNext=True)
        body_style = ParagraphStyle("Bdy", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#334155"))
        
        story = []
        story.append(Spacer(1, 20))
        story.append(Paragraph("AI ANALYSIS PIPELINE REPORT", title_style))
        story.append(Spacer(1, 10))
        
        date_str = datetime.now(timezone.utc).strftime("%d %B %Y %H:%M UTC")
        meta_data = [
            [Paragraph("<b>Report Timestamp:</b>", body_style), Paragraph(date_str, body_style)],
            [Paragraph("<b>Observation Sighting ID:</b>", body_style), Paragraph(str(observation.id) if observation else "N/A", body_style)],
            [Paragraph("<b>Resolved Species Label:</b>", body_style), Paragraph(primary_species, body_style)],
            [Paragraph("<b>Monitoring Site:</b>", body_style), Paragraph(site.name if site else "N/A", body_style)],
            [Paragraph("<b>Reporter Account:</b>", body_style), Paragraph(reporter.full_name if reporter else "Autonomous Telemetry", body_style)]
        ]
        meta_table = Table(meta_data, colWidths=[160, 340])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(meta_table)
        story.append(Spacer(1, 15))
        
        # YOLO Detections Card
        if image_json and image_json.get("success"):
            story.append(Paragraph("Module 1 – Image Detection Output (YOLOv8)", section_style))
            story.append(Paragraph(f"Processing Latency: {image_json.get('processing_time', 0.0)}s | Total Detections: {image_json.get('total_detections', 0)}", body_style))
            story.append(Spacer(1, 10))
            
            det_data = [
                [Paragraph("<b>Label</b>", body_style), Paragraph("<b>Confidence</b>", body_style), Paragraph("<b>Bounding Box Coordinates</b>", body_style)]
            ]
            for d in image_json.get("detections", []):
                cb = d.get("bounding_box", {})
                det_data.append([
                    Paragraph(d["species"], body_style),
                    Paragraph(f"{d['confidence']:.2f}%", body_style),
                    Paragraph(f"[{cb.get('x1')}, {cb.get('y1')}, {cb.get('x2')}, {cb.get('y2')}]", body_style)
                ])
            t_det = Table(det_data, colWidths=[150, 100, 250])
            t_det.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                ('PADDING', (0,0), (-1,-1), 6),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ]))
            story.append(t_det)
            story.append(Spacer(1, 15))
            
        # Audio classifier
        if audio_json and audio_json.get("success"):
            story.append(Paragraph("Module 2 – Audio Classification Output (EfficientNet-B0)", section_style))
            top_p = audio_json.get("top_prediction", {})
            story.append(Paragraph(f"Classification Score: {top_p.get('common_name')} ({top_p.get('scientific_name')}) with {top_p.get('confidence')}% probability.", body_style))
            story.append(Spacer(1, 10))
            
            top5_data = [
                [Paragraph("<b>Rank</b>", body_style), Paragraph("<b>Common Name</b>", body_style), Paragraph("<b>Scientific Name</b>", body_style), Paragraph("<b>Probability</b>", body_style)]
            ]
            for p in audio_json.get("top5_predictions", []):
                top5_data.append([
                    Paragraph(str(p.get("rank")), body_style),
                    Paragraph(p.get("common_name"), body_style),
                    Paragraph(p.get("scientific_name"), body_style),
                    Paragraph(f"{p.get('confidence')}%", body_style)
                ])
            t5_tab = Table(top5_data, colWidths=[50, 150, 150, 150])
            t5_tab.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f8fafc")),
                ('PADDING', (0,0), (-1,-1), 5),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ]))
            story.append(t5_tab)
            story.append(Spacer(1, 15))
            
        if profile:
            story.append(Paragraph("Biological Classification Profile", section_style))
            prof_d = [
                [Paragraph("<b>Status:</b>", body_style), Paragraph(profile.conservation_status, body_style),
                 Paragraph("<b>Trend:</b>", body_style), Paragraph(profile.population_trend, body_style)],
                [Paragraph("<b>Diet:</b>", body_style), Paragraph(profile.diet, body_style),
                 Paragraph("<b>Regions:</b>", body_style), Paragraph(profile.native_regions, body_style)]
            ]
            t_prof = Table(prof_d, colWidths=[100, 150, 100, 150])
            t_prof.setStyle(TableStyle([
                ('PADDING', (0,0), (-1,-1), 6),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ]))
            story.append(t_prof)
            story.append(Spacer(1, 15))
            
        self.add_unified_metadata_summary(db, story, styles, body_style)
        doc.build(story, canvasmaker=NumberedCanvas)
        return f"/static/uploads/reports/{pdf_filename}"

    def generate_observation_report(self, db: Session, observation_id: uuid.UUID) -> str:
        """
        Generates PDF report for a single Wildlife Sighting Log.
        """
        obs = db.query(Observation).filter(Observation.id == observation_id).first()
        if not obs:
            raise ValueError("Observation not found")
            
        site = obs.site
        reporter = obs.reporter
        
        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = f"report_observation_{observation_id.hex}.pdf"
        pdf_path = reports_dir / pdf_filename
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle("ObsTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.HexColor("#065f46"), alignment=0, spaceAfter=20)
        body_style = ParagraphStyle("ObsBdy", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#334155"))
        
        story.append(Paragraph(f"WILDLIFE SIGHTING LOG REPORT: {obs.species.upper()}", title_style))
        
        meta_d = [
            [Paragraph("<b>Sighting Log ID:</b>", body_style), Paragraph(str(obs.id), body_style)],
            [Paragraph("<b>Observed Count:</b>", body_style), Paragraph(str(obs.count), body_style)],
            [Paragraph("<b>Sighting Date/Time:</b>", body_style), Paragraph(obs.observed_at.strftime("%d %B %Y %H:%M UTC"), body_style)],
            [Paragraph("<b>Coordinates (Lat, Lon):</b>", body_style), Paragraph(f"{obs.latitude:.5f}, {obs.longitude:.5f}", body_style)],
            [Paragraph("<b>Monitoring Site Location:</b>", body_style), Paragraph(site.name if site else "N/A", body_style)],
            [Paragraph("<b>Observer Account:</b>", body_style), Paragraph(reporter.full_name if reporter else "Autonomous Sighting Sensor", body_style)],
            [Paragraph("<b>Log Sighting Notes:</b>", body_style), Paragraph(obs.notes or "No additional notes provided.", body_style)]
        ]
        
        t_meta = Table(meta_d, colWidths=[180, 320])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 15))
        
        self.add_unified_metadata_summary(db, story, styles, body_style)
        doc.build(story, canvasmaker=NumberedCanvas)
        return f"/static/uploads/reports/{pdf_filename}"

    def generate_population_report(
        self, 
        db: Session,
        site_id: str = None,
        species: str = None,
        habitat: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> str:
        """
        Generates a dynamic filtered population demographics PDF report.
        """
        obs_list = self.get_filtered_observations(db, site_id, species, habitat, status, start_date, end_date)
        site_name = db.query(MonitoringSite).filter(MonitoringSite.id == uuid.UUID(site_id)).first().name if site_id else None
        
        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = f"report_population_summary.pdf"
        pdf_path = reports_dir / pdf_filename
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle("PopTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.HexColor("#065f46"), alignment=0, spaceAfter=15)
        section_style = ParagraphStyle("PopSec", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=colors.HexColor("#0f172a"), spaceBefore=15, spaceAfter=8)
        body_style = ParagraphStyle("PopBdy", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#334155"))
        
        story.append(Paragraph("SPECIES POPULATION SUMMARY REPORT", title_style))
        self.add_selected_filters_summary(story, body_style, site_name, species, habitat, status, start_date, end_date)
        story.append(Paragraph("Dynamic species sighting statistics and counts compiled from active monitoring sensors.", body_style))
        story.append(Spacer(1, 15))
        
        total_animals = sum(o.count for o in obs_list)
        
        meta_d = [
            [Paragraph("<b>Total Sighting Logs:</b>", body_style), Paragraph(str(len(obs_list)), body_style)],
            [Paragraph("<b>Observed Animal Count:</b>", body_style), Paragraph(f"{total_animals} sighted", body_style)],
            [Paragraph("<b>Distribution Sites:</b>", body_style), Paragraph(f"{len(set(o.site_id for o in obs_list))} sites", body_style)],
            [Paragraph("<b>Report Primary Status:</b>", body_style), Paragraph("Filtered Abundance Census", body_style)]
        ]
        t_meta = Table(meta_d, colWidths=[200, 300])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 15))
        
        # Species distribution table
        story.append(Paragraph("Sighting Abundance & Distribution Breakdown", section_style))
        
        species_counts = {}
        for o in obs_list:
            if o.species:
                species_counts[o.species] = species_counts.get(o.species, 0) + o.count
                
        dist_data = [
            [Paragraph("<b>Species Sighted</b>", body_style), Paragraph("<b>Sighting Count</b>", body_style), Paragraph("<b>Percentage of Total</b>", body_style)]
        ]
        for sp, count in sorted(species_counts.items(), key=lambda x: x[1], reverse=True):
            pct = round((count / total_animals * 100), 1) if total_animals > 0 else 0
            dist_data.append([
                Paragraph(sp, body_style),
                Paragraph(str(count), body_style),
                Paragraph(f"{pct}%", body_style)
            ])
            
        if not species_counts:
            dist_data.append([Paragraph("No observations matched criteria.", body_style), Paragraph("0", body_style), Paragraph("0%", body_style)])
            
        t_dist = Table(dist_data, colWidths=[200, 150, 150])
        t_dist.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_dist)
        story.append(Spacer(1, 15))
        
        self.add_unified_metadata_summary(db, story, styles, body_style)
        doc.build(story, canvasmaker=NumberedCanvas)
        return f"/static/uploads/reports/{pdf_filename}"

    def generate_ecology_report(
        self, 
        db: Session,
        site_id: str = None,
        species: str = None,
        habitat: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> str:
        """
        Generates a summary ecological intelligence metrics PDF report.
        """
        from app.services.ecological_service import ecological_service
        data = ecological_service.generate_report(db)
        site_name = db.query(MonitoringSite).filter(MonitoringSite.id == uuid.UUID(site_id)).first().name if site_id else None
        
        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = f"report_ecology_summary.pdf"
        pdf_path = reports_dir / pdf_filename
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle("EcoTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.HexColor("#065f46"), alignment=0, spaceAfter=15)
        section_style = ParagraphStyle("EcoSec", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=colors.HexColor("#0f172a"), spaceBefore=15, spaceAfter=8)
        body_style = ParagraphStyle("EcoBdy", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#334155"))
        bullet_style = ParagraphStyle("EcoBul", parent=body_style, leftIndent=20, firstLineIndent=-10, spaceAfter=4)
        
        story.append(Paragraph("ECOLOGICAL INTELLIGENCE SUMMARY REPORT", title_style))
        self.add_selected_filters_summary(story, body_style, site_name, species, habitat, status, start_date, end_date)
        story.append(Paragraph("Dynamic biodiversity assessments, habitat health scores, and conservation suggestions.", body_style))
        story.append(Spacer(1, 15))
        
        meta_d = [
            [Paragraph("<b>Species Richness Index:</b>", body_style), Paragraph(str(data.get("species_richness")), body_style)],
            [Paragraph("<b>Shannon Biodiversity Index:</b>", body_style), Paragraph(str(data.get("biodiversity_index")), body_style)],
            [Paragraph("<b>Habitat Suitability Rating:</b>", body_style), Paragraph(f"{data.get('habitat_suitability_score')}%", body_style)],
            [Paragraph("<b>Weighted Wildlife Health Score:</b>", body_style), Paragraph(f"{data.get('wildlife_health_score')}/100 ({data.get('wildlife_health_status')})", body_style)],
            [Paragraph("<b>Threatened IUCN Species Count:</b>", body_style), Paragraph(str(data.get("threatened_species_count")), body_style)]
        ]
        t_meta = Table(meta_d, colWidths=[220, 280])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 15))
        
        story.append(Paragraph("Key Conservation Recommendations", section_style))
        for sug in data.get("conservation_suggestions", []):
            story.append(Paragraph(f"• {sug}", bullet_style))
        story.append(Spacer(1, 15))
            
        self.add_unified_metadata_summary(db, story, styles, body_style)
        doc.build(story, canvasmaker=NumberedCanvas)
        return f"/static/uploads/reports/{pdf_filename}"

    def generate_biodiversity_report(
        self, 
        db: Session,
        site_id: str = None,
        species: str = None,
        habitat: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> str:
        """
        Generates a dedicated biodiversity analysis PDF report.
        """
        obs_list = self.get_filtered_observations(db, site_id, species, habitat, status, start_date, end_date)
        site_name = db.query(MonitoringSite).filter(MonitoringSite.id == uuid.UUID(site_id)).first().name if site_id else None
        
        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = f"report_biodiversity_summary.pdf"
        pdf_path = reports_dir / pdf_filename
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle("BioTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.HexColor("#065f46"), alignment=0, spaceAfter=15)
        section_style = ParagraphStyle("BioSec", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=colors.HexColor("#0f172a"), spaceBefore=15, spaceAfter=8)
        body_style = ParagraphStyle("BioBdy", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#334155"))
        
        story.append(Paragraph("BIODIVERSITY INDEX CENSUS REPORT", title_style))
        self.add_selected_filters_summary(story, body_style, site_name, species, habitat, status, start_date, end_date)
        story.append(Paragraph("Dynamic biodiversity evaluations (Shannon Wiener, Simpson) computed from filtered observations.", body_style))
        story.append(Spacer(1, 15))
        
        # Calculate indices
        unique_species = list(set(o.species for o in obs_list if o.species))
        species_richness = len(unique_species)
        total_count = sum(o.count for o in obs_list)
        
        species_counts = {}
        for o in obs_list:
            if o.species:
                species_counts[o.species] = species_counts.get(o.species, 0) + o.count
                
        shannon = 0.0
        simpson = 0.0
        evenness = 0.0
        
        if total_count > 0 and species_richness > 0:
            s_sum = 0.0
            sq_sum = 0.0
            for sp, val in species_counts.items():
                p = val / total_count
                if p > 0:
                    s_sum += p * math.log(p)
                sq_sum += p * p
                
            shannon = round(-s_sum, 3)
            simpson = round(1 - sq_sum, 3)
            if species_richness > 1:
                evenness = round(shannon / math.log(species_richness), 3)
                
        meta_d = [
            [Paragraph("<b>Species Richness (S):</b>", body_style), Paragraph(str(species_richness), body_style)],
            [Paragraph("<b>Shannon Index (H'):</b>", body_style), Paragraph(str(shannon), body_style)],
            [Paragraph("<b>Simpson's Index (1 - D):</b>", body_style), Paragraph(str(simpson), body_style)],
            [Paragraph("<b>Evenness Index (J'):</b>", body_style), Paragraph(str(evenness), body_style)],
            [Paragraph("<b>Total Animals Count:</b>", body_style), Paragraph(str(total_count), body_style)]
        ]
        t_meta = Table(meta_d, colWidths=[200, 300])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 15))
        
        story.append(Paragraph("Relative Species Abundance Data", section_style))
        dist_data = [
            [Paragraph("<b>Species Label</b>", body_style), Paragraph("<b>Sighting Quantity</b>", body_style), Paragraph("<b>Proportional Abundance (pi)</b>", body_style)]
        ]
        for sp, count in sorted(species_counts.items(), key=lambda x: x[1], reverse=True):
            pi = round(count / total_count, 3) if total_count > 0 else 0
            dist_data.append([
                Paragraph(sp, body_style),
                Paragraph(str(count), body_style),
                Paragraph(str(pi), body_style)
            ])
            
        if not species_counts:
            dist_data.append([Paragraph("No observations matching filter.", body_style), Paragraph("0", body_style), Paragraph("0.0", body_style)])
            
        t_dist = Table(dist_data, colWidths=[200, 150, 150])
        t_dist.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_dist)
        story.append(Spacer(1, 15))
        
        self.add_unified_metadata_summary(db, story, styles, body_style)
        doc.build(story, canvasmaker=NumberedCanvas)
        return f"/static/uploads/reports/{pdf_filename}"

    def generate_global_survey_report(
        self, 
        db: Session,
        site_id: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> str:
        """
        Generates a summary of all Surveys PDF report.
        """
        query = db.query(Survey)
        if site_id:
            query = query.join(Survey.monitoring_sites).filter(MonitoringSite.id == uuid.UUID(site_id))
        if start_date:
            try:
                query = query.filter(Survey.start_date >= datetime.strptime(start_date, "%Y-%m-%d").date())
            except Exception:
                pass
        if end_date:
            try:
                query = query.filter(Survey.end_date <= datetime.strptime(end_date, "%Y-%m-%d").date())
            except Exception:
                pass
        surveys = query.order_by(Survey.start_date.desc()).all()
        site_name = db.query(MonitoringSite).filter(MonitoringSite.id == uuid.UUID(site_id)).first().name if site_id else None
        
        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = "report_surveys_summary.pdf"
        pdf_path = reports_dir / pdf_filename
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle("SrvsTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.HexColor("#065f46"), alignment=0, spaceAfter=15)
        body_style = ParagraphStyle("SrvsBdy", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#334155"))
        
        story.append(Paragraph("GLOBAL FIELD SURVEYS SUMMARY REPORT", title_style))
        self.add_selected_filters_summary(story, body_style, site_name, start_date=start_date, end_date=end_date)
        story.append(Paragraph("Aggregated overview of active and historical monitoring campaigns logged in the system.", body_style))
        story.append(Spacer(1, 15))
        
        table_data = [
            [Paragraph("<b>Survey Name</b>", body_style), Paragraph("<b>Investigator</b>", body_style), Paragraph("<b>Status</b>", body_style), Paragraph("<b>Timeline</b>", body_style)]
        ]
        for s in surveys:
            timeline = f"{s.start_date} to {s.end_date or 'Active'}"
            table_data.append([
                Paragraph(s.name or "N/A", body_style),
                Paragraph(s.investigator if hasattr(s, "investigator") else "Forest Officer", body_style),
                Paragraph(s.status.value if hasattr(s.status, "value") else str(s.status), body_style),
                Paragraph(timeline, body_style)
            ])
            
        if not surveys:
            table_data.append([Paragraph("No surveys matching filters.", body_style), Paragraph("N/A", body_style), Paragraph("N/A", body_style), Paragraph("N/A", body_style)])
            
        t_srvs = Table(table_data, colWidths=[150, 120, 80, 150])
        t_srvs.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_srvs)
        story.append(Spacer(1, 15))
        
        self.add_unified_metadata_summary(db, story, styles, body_style)
        doc.build(story, canvasmaker=NumberedCanvas)
        return f"/static/uploads/reports/{pdf_filename}"

    def generate_habitat_report(
        self, 
        db: Session,
        site_id: str = None,
        habitat: str = None
    ) -> str:
        """
        Generates a summary of all Monitoring Sites suitability and risk parameters.
        """
        query = db.query(MonitoringSite)
        if site_id:
            query = query.filter(MonitoringSite.id == uuid.UUID(site_id))
        if habitat:
            query = query.filter(MonitoringSite.habitat_type == habitat)
        sites = query.all()
        site_name = db.query(MonitoringSite).filter(MonitoringSite.id == uuid.UUID(site_id)).first().name if site_id else None
        
        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = "report_habitat_summary.pdf"
        pdf_path = reports_dir / pdf_filename
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle("HabTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.HexColor("#065f46"), alignment=0, spaceAfter=15)
        body_style = ParagraphStyle("HabBdy", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#334155"))
        
        story.append(Paragraph("HABITAT SUITABILITY & RISK ASSESSMENT REPORT", title_style))
        self.add_selected_filters_summary(story, body_style, site_name, habitat=habitat)
        story.append(Paragraph("Comparative ecological monitoring parameters, foliage coverage, and human conflict indices across sites.", body_style))
        story.append(Spacer(1, 15))
        
        table_data = [
            [Paragraph("<b>Site Name</b>", body_style), Paragraph("<b>Habitat Category</b>", body_style), Paragraph("<b>Coordinates</b>", body_style), Paragraph("<b>Suitability Rating</b>", body_style)]
        ]
        from app.services.ecological_service import ecological_service
        for s in sites:
            coords = f"{s.latitude:.4f}, {s.longitude:.4f}"
            try:
                site_report = ecological_service.generate_report(db, s.id)
                score = site_report.get("habitat_suitability_score", 50.0)
                suitability = f"{score}%"
            except Exception:
                suitability = "N/A"
            table_data.append([
                Paragraph(s.name or "N/A", body_style),
                Paragraph(s.habitat_type.value if hasattr(s.habitat_type, 'value') else str(s.habitat_type), body_style),
                Paragraph(coords, body_style),
                Paragraph(suitability, body_style)
            ])
            
        if not sites:
            table_data.append([Paragraph("No monitoring sites matching filters.", body_style), Paragraph("N/A", body_style), Paragraph("N/A", body_style), Paragraph("N/A", body_style)])
            
        t_hab = Table(table_data, colWidths=[150, 120, 110, 120])
        t_hab.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_hab)
        story.append(Spacer(1, 15))
        
        self.add_unified_metadata_summary(db, story, styles, body_style)
        doc.build(story, canvasmaker=NumberedCanvas)
        return f"/static/uploads/reports/{pdf_filename}"

    def generate_conservation_report(
        self, 
        db: Session,
        status: str = None
    ) -> str:
        """
        Generates a summary of species priority ratings and recommendations.
        """
        query = db.query(SpeciesProfile)
        if status:
            query = query.filter(SpeciesProfile.conservation_status == status)
        species_list = query.all()
        
        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = "report_conservation_recommendations.pdf"
        pdf_path = reports_dir / pdf_filename
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle("ConsTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.HexColor("#065f46"), alignment=0, spaceAfter=15)
        body_style = ParagraphStyle("ConsBdy", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#334155"))
        
        story.append(Paragraph("SPECIES CONSERVATION PRIORITIES & RECOVERY REPORT", title_style))
        self.add_selected_filters_summary(story, body_style, status=status)
        story.append(Paragraph("Detailed priority ratings based on threat levels, population trends, and active observation deficiencies.", body_style))
        story.append(Spacer(1, 15))
        
        table_data = [
            [Paragraph("<b>Species Name</b>", body_style), Paragraph("<b>IUCN Threat Status</b>", body_style), Paragraph("<b>Diet</b>", body_style), Paragraph("<b>Population Trend</b>", body_style)]
        ]
        for sp in species_list:
            table_data.append([
                Paragraph(sp.common_name or "N/A", body_style),
                Paragraph(sp.conservation_status or "N/A", body_style),
                Paragraph(sp.diet or "N/A", body_style),
                Paragraph(sp.population_trend or "N/A", body_style)
            ])
            
        if not species_list:
            table_data.append([Paragraph("No species matching threat level.", body_style), Paragraph("N/A", body_style), Paragraph("N/A", body_style), Paragraph("N/A", body_style)])
            
        t_cons = Table(table_data, colWidths=[150, 130, 100, 120])
        t_cons.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
            ('PADDING', (0,0), (-1,-1), 6),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_cons)
        story.append(Spacer(1, 15))
        
        self.add_unified_metadata_summary(db, story, styles, body_style)
        doc.build(story, canvasmaker=NumberedCanvas)
        return f"/static/uploads/reports/{pdf_filename}"

    def generate_survey_report(self, db: Session, survey_id: uuid.UUID) -> str:
        """
        Generates a summary survey observations PDF report.
        """
        srv = db.query(Survey).filter(Survey.id == survey_id).first()
        if not srv:
            raise ValueError("Survey not found")
            
        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        pdf_filename = f"report_survey_{survey_id.hex}.pdf"
        pdf_path = reports_dir / pdf_filename
        
        doc = SimpleDocTemplate(str(pdf_path), pagesize=letter, rightMargin=54, leftMargin=54, topMargin=72, bottomMargin=72)
        styles = getSampleStyleSheet()
        story = []
        
        title_style = ParagraphStyle("SrvTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=22, leading=26, textColor=colors.HexColor("#065f46"), alignment=0, spaceAfter=20)
        body_style = ParagraphStyle("SrvBdy", parent=styles["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13.5, textColor=colors.HexColor("#334155"))
        
        story.append(Paragraph(f"FIELD SURVEY MONITORING REPORT: {srv.name.upper()}", title_style))
        
        meta_d = [
            [Paragraph("<b>Survey ID:</b>", body_style), Paragraph(str(srv.id), body_style)],
            [Paragraph("<b>Status:</b>", body_style), Paragraph(srv.status.value if hasattr(srv.status, 'value') else str(srv.status), body_style)],
            [Paragraph("<b>Time Range:</b>", body_style), Paragraph(f"{srv.start_date} to {srv.end_date}", body_style)]
        ]
        t_meta = Table(meta_d, colWidths=[150, 350])
        t_meta.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f8fafc")),
            ('PADDING', (0,0), (-1,-1), 8),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
        ]))
        story.append(t_meta)
        story.append(Spacer(1, 15))
        
        story.append(Paragraph("Sighting Logs Recorded Under Survey sites", ParagraphStyle("SrvSec", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=17, textColor=colors.HexColor("#0f172a"), spaceAfter=10)))
        
        sites = db.query(MonitoringSite).filter(MonitoringSite.survey_id == srv.id).all()
        site_ids = [s.id for s in sites]
        obs_list = db.query(Observation).filter(Observation.site_id.in_(site_ids)).order_by(Observation.observed_at.desc()).all()
        
        obs_data = [
            [Paragraph("<b>Species</b>", body_style), Paragraph("<b>Count</b>", body_style), Paragraph("<b>Observation Site</b>", body_style), Paragraph("<b>Sighted Time</b>", body_style)]
        ]
        for o in obs_list:
            obs_data.append([
                Paragraph(o.species, body_style),
                Paragraph(str(o.count), body_style),
                Paragraph(o.site.name if o.site else "N/A", body_style),
                Paragraph(o.observed_at.strftime("%Y-%m-%d %H:%M"), body_style)
            ])
            
        if len(obs_list) > 0:
            t_obs = Table(obs_data, colWidths=[130, 70, 150, 150])
            t_obs.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
                ('PADDING', (0,0), (-1,-1), 6),
                ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#e2e8f0")),
            ]))
            story.append(t_obs)
        else:
            story.append(Paragraph("No sightings recorded yet for this survey.", body_style))
        story.append(Spacer(1, 15))
            
        self.add_unified_metadata_summary(db, story, styles, body_style)
        doc.build(story, canvasmaker=NumberedCanvas)
        return f"/static/uploads/reports/{pdf_filename}"

    def save_excel_workbook(self, headers: list, rows: list, filename: str) -> str:
        import openpyxl
        from openpyxl.styles import Font, PatternFill, Alignment
        
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Report Data"
        
        # Header Styling
        header_font = Font(name="Arial", size=11, bold=True, color="FFFFFF")
        header_fill = PatternFill(start_color="065F46", end_color="065F46", fill_type="solid")
        
        ws.append(headers)
        for col_num in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=col_num)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = Alignment(horizontal="center")
            
        # Add data rows
        for row in rows:
            ws.append(row)
            
        # Auto-adjust column widths
        for col in ws.columns:
            vals = [cell.value for cell in col if cell.value is not None]
            max_len = max(len(str(v)) for v in vals) if vals else 0
            col_letter = openpyxl.utils.get_column_letter(col[0].column)
            ws.column_dimensions[col_letter].width = max(max_len + 3, 10)
            
        reports_dir = Path(settings.UPLOAD_DIR) / "reports"
        reports_dir.mkdir(parents=True, exist_ok=True)
        file_path = reports_dir / filename
        wb.save(str(file_path))
        return f"/static/uploads/reports/{filename}"

    def generate_excel_by_id(
        self,
        db: Session,
        target_id: str,
        site_id: str = None,
        species: str = None,
        habitat: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> str:
        """
        Dispatches excel spreadsheet compiling based on string target.
        Returns the static relative URL path to the generated Excel file.
        """
        tid_lower = target_id.lower().strip()
        
        if tid_lower == "survey":
            return self.generate_survey_excel(db, site_id, start_date, end_date)
        elif tid_lower == "population":
            return self.generate_population_excel(db, site_id, species, habitat, status, start_date, end_date)
        elif tid_lower == "biodiversity":
            return self.generate_biodiversity_excel(db, site_id, species, habitat, status, start_date, end_date)
        elif tid_lower == "habitat":
            return self.generate_habitat_excel(db, site_id, habitat)
        elif tid_lower == "conservation":
            return self.generate_conservation_excel(db, status)
            
        raise ValueError(f"Excel export not supported for target: {target_id}")

    def generate_survey_excel(self, db: Session, site_id: str = None, start_date: str = None, end_date: str = None) -> str:
        query = db.query(Survey)
        if site_id:
            query = query.join(Survey.monitoring_sites).filter(MonitoringSite.id == uuid.UUID(site_id))
        if start_date:
            try:
                query = query.filter(Survey.start_date >= datetime.strptime(start_date, "%Y-%m-%d").date())
            except Exception:
                pass
        if end_date:
            try:
                query = query.filter(Survey.end_date <= datetime.strptime(end_date, "%Y-%m-%d").date())
            except Exception:
                pass
        surveys = query.all()
        headers = ["Survey Name", "Investigator", "Status", "Start Date", "End Date"]
        rows = []
        for s in surveys:
            rows.append([
                s.name or "N/A",
                s.investigator if hasattr(s, "investigator") else "Forest Officer",
                s.status.value if hasattr(s.status, 'value') else str(s.status),
                str(s.start_date),
                str(s.end_date) if s.end_date else "Active"
            ])
        return self.save_excel_workbook(headers, rows, "report_surveys_summary.xlsx")

    def generate_population_excel(
        self,
        db: Session,
        site_id: str = None,
        species: str = None,
        habitat: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> str:
        obs_list = self.get_filtered_observations(db, site_id, species, habitat, status, start_date, end_date)
        headers = ["Sighting ID", "Species Sighted", "Count", "Observed At", "Latitude", "Longitude", "Site Name"]
        rows = []
        for o in obs_list:
            rows.append([
                str(o.id),
                o.species,
                o.count,
                o.observed_at.strftime("%Y-%m-%d %H:%M"),
                o.latitude,
                o.longitude,
                o.site.name if o.site else "N/A"
            ])
        return self.save_excel_workbook(headers, rows, "report_population_summary.xlsx")

    def generate_biodiversity_excel(
        self,
        db: Session,
        site_id: str = None,
        species: str = None,
        habitat: str = None,
        status: str = None,
        start_date: str = None,
        end_date: str = None
    ) -> str:
        obs_list = self.get_filtered_observations(db, site_id, species, habitat, status, start_date, end_date)
        total_count = sum(o.count for o in obs_list)
        species_counts = {}
        for o in obs_list:
            if o.species:
                species_counts[o.species] = species_counts.get(o.species, 0) + o.count
        headers = ["Species Name", "Sighting Count", "Proportional Abundance (pi)"]
        rows = []
        for sp, count in sorted(species_counts.items(), key=lambda x: x[1], reverse=True):
            pi = round(count / total_count, 3) if total_count > 0 else 0
            rows.append([sp, count, pi])
        return self.save_excel_workbook(headers, rows, "report_biodiversity_summary.xlsx")

    def generate_habitat_excel(self, db: Session, site_id: str = None, habitat: str = None) -> str:
        query = db.query(MonitoringSite)
        if site_id:
            query = query.filter(MonitoringSite.id == uuid.UUID(site_id))
        if habitat:
            query = query.filter(MonitoringSite.habitat_type == habitat)
        sites = query.all()
        from app.services.ecological_service import ecological_service
        headers = ["Site Name", "Habitat Type", "Latitude", "Longitude", "Suitability Score", "Vegetation Density", "Human Conflict Level"]
        rows = []
        for s in sites:
            try:
                rep = ecological_service.generate_report(db, s.id)
                score = f"{rep.get('habitat_suitability_score')}%"
                veg = f"{rep.get('vegetation_density')}%"
                conflict = rep.get('human_conflict_level', 'Low')
            except Exception:
                score = "N/A"
                veg = "N/A"
                conflict = "N/A"
            rows.append([
                s.name,
                s.habitat_type.value if hasattr(s.habitat_type, 'value') else str(s.habitat_type),
                s.latitude,
                s.longitude,
                score,
                veg,
                conflict
            ])
        return self.save_excel_workbook(headers, rows, "report_habitat_summary.xlsx")

    def generate_conservation_excel(self, db: Session, status: str = None) -> str:
        query = db.query(SpeciesProfile)
        if status:
            query = query.filter(SpeciesProfile.conservation_status == status)
        species_list = query.all()
        headers = ["Species Name", "IUCN Conservation Status", "Diet Type", "Population Trend"]
        rows = []
        for sp in species_list:
            rows.append([
                sp.common_name or "N/A",
                sp.conservation_status or "N/A",
                sp.diet or "N/A",
                sp.population_trend or "N/A"
            ])
        return self.save_excel_workbook(headers, rows, "report_conservation_recommendations.xlsx")

report_service = ReportGeneratorService()
