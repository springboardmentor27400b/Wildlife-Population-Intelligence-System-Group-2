import { useEffect, useState } from "react";

import {
    FileText,
    Download,
    Calendar,
    User,
    Trash2,
    CheckCircle,
    Clock,
    X,
    Loader2,
    BarChart3,
    Leaf,
    TreePine,
    ShieldCheck
} from "lucide-react";

import {
    getReports,
    deleteReport,
    generateReport
} from "../services/reportService";

import {
    getAllReportExports
} from "../services/reportExportService";

import { getAllSurveys } from "../services/SurveyService";

import { useAuth } from "@/contexts/AuthContext";

import { toast } from "sonner";

import type { Report } from "../types/report";


// ============================================================
// SURVEY TYPE
// ============================================================

interface Survey {

    surveyId: number;

    surveyName: string;

    description?: string;

    habitatType?: string;

    protectedArea?: string;

    surveyDate?: string;

    status?: string;

}


// ============================================================
// REPORT TYPES
// ============================================================

const reportTypes = [

    {
        value: "POPULATION",
        label: "Population Report",
        description:
            "Wildlife population estimates, species distribution and population trends.",
        icon: BarChart3,
        color: "bg-blue-600"
    },

    {
        value: "BIODIVERSITY",
        label: "Biodiversity Report",
        description:
            "Species richness, biodiversity indicators and ecosystem observations.",
        icon: Leaf,
        color: "bg-green-600"
    },

    {
        value: "HABITAT",
        label: "Habitat Report",
        description:
            "Habitat health, vegetation, degradation and environmental conditions.",
        icon: TreePine,
        color: "bg-emerald-600"
    },

    {
        value: "CONSERVATION",
        label: "Conservation Report",
        description:
            "Conservation status, threats, priorities and recommendations.",
        icon: ShieldCheck,
        color: "bg-purple-600"
    }

];


// ============================================================
// MAIN COMPONENT
// ============================================================

export default function Reports() {


    const { user } = useAuth();


    const [reports, setReports] =
        useState<Report[]>([]);


    const [surveys, setSurveys] =
        useState<Survey[]>([]);


    const [loading, setLoading] =
        useState(true);


    const [generating, setGenerating] =
        useState(false);


    const [showModal, setShowModal] =
        useState(false);


    const [selectedSurvey, setSelectedSurvey] =
        useState("");


    const [selectedType, setSelectedType] =
        useState("POPULATION");


    // ========================================================
    // LOAD DATA
    // ========================================================

    useEffect(() => {

        loadData();

    }, []);


    const loadData = async () => {

        try {

            setLoading(true);


            const [
                reportsData,
                surveysData
            ] = await Promise.all([

                getReports(),

                getAllSurveys()

            ]);


            setReports(reportsData || []);

            setSurveys(surveysData || []);

        }

        catch (error) {

            console.error(error);

            toast.error(
                "Failed to load reports"
            );

        }

        finally {

            setLoading(false);

        }

    };


    // ========================================================
    // DELETE REPORT
    // ========================================================

    const removeReport = async (
        id: number
    ) => {

        try {

            await deleteReport(id);

            toast.success(
                "Report deleted successfully"
            );

            await loadData();

        }

        catch (error) {

            console.error(error);

            toast.error(
                "Failed to delete report"
            );

        }

    };


    // ========================================================
    // GENERATE REPORT
    // ========================================================

    const handleGenerateReport = async () => {


        if (!selectedSurvey) {

            toast.error(
                "Please select a survey"
            );

            return;

        }


        if (!user?.id) {

            toast.error(
                "Unable to identify logged-in user"
            );

            return;

        }


        const userId =
            Number(user.id);


        if (Number.isNaN(userId)) {

            toast.error(
                "Invalid user ID"
            );

            return;

        }


        try {

            setGenerating(true);


            await generateReport(

                selectedType,

                Number(selectedSurvey),

                userId

            );


            toast.success(
                "Report generated successfully!"
            );


            setShowModal(false);


            setSelectedSurvey("");


            setSelectedType(
                "POPULATION"
            );


            await loadData();

        }

        catch (error: any) {

            console.error(
                "Report generation error:",
                error
            );


            toast.error(
                error?.response?.data?.message ||
                "Failed to generate report"
            );

        }

        finally {

            setGenerating(false);

        }

    };


    // ========================================================
    // DOWNLOAD REPORT
    // ========================================================

    const handleDownload = async (
        report: Report
    ) => {

        try {

            /*
             * Your backend stores the generated
             * report path.
             *
             * If reportPath is a direct backend
             * URL/path, open it.
             */

            if (!report.reportPath) {

                toast.error(
                    "Report file is not available"
                );

                return;

            }


            const path =
                report.reportPath;


            const url =
                path.startsWith("http")
                    ? path
                    : `http://localhost:8080${path}`;


            window.open(
                url,
                "_blank"
            );

        }

        catch (error) {

            console.error(error);

            toast.error(
                "Unable to download report"
            );

        }

    };


    // ========================================================
    // COUNTS
    // ========================================================

    const totalReports =
        reports.length;


    const readyReports =
        reports.filter(
            r =>
                r.reportStatus === "READY" ||
                r.reportStatus === "COMPLETED"
        ).length;


    const populationReports =
        reports.filter(
            r =>
                r.reportType === "POPULATION"
        ).length;


    const biodiversityReports =
        reports.filter(
            r =>
                r.reportType === "BIODIVERSITY"
        ).length;


    const habitatReports =
        reports.filter(
            r =>
                r.reportType === "HABITAT"
        ).length;


    const conservationReports =
        reports.filter(
            r =>
                r.reportType === "CONSERVATION"
        ).length;


    // ========================================================
    // LOADING
    // ========================================================

    if (loading) {

        return (

            <div className="
                min-h-screen
                bg-[#f7faf7]
                flex
                items-center
                justify-center
            ">

                <div className="
                    flex
                    flex-col
                    items-center
                    gap-3
                    text-gray-500
                ">

                    <Loader2
                        size={35}
                        className="animate-spin text-green-600"
                    />

                    <p>
                        Loading wildlife reports...
                    </p>

                </div>

            </div>

        );

    }


    // ========================================================
    // UI
    // ========================================================

    return (

        <div className="
            p-8
            space-y-10
            bg-[#f7faf7]
            min-h-screen
        ">


            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="
                flex
                flex-col
                lg:flex-row
                lg:justify-between
                lg:items-center
                gap-5
            ">


                <div>

                    <h1 className="
                        text-4xl
                        font-bold
                        text-gray-900
                    ">

                        Wildlife Reports 📄

                    </h1>


                    <p className="
                        text-gray-500
                        mt-2
                    ">

                        Generate, analyze and manage
                        wildlife intelligence reports.

                    </p>

                </div>


                <button

                    onClick={() =>
                        setShowModal(true)
                    }

                    className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        bg-green-600
                        text-white
                        px-6
                        py-3
                        rounded-xl
                        shadow
                        hover:bg-green-700
                        transition
                    "
                >

                    <FileText size={18}/>

                    Generate Report

                </button>


            </div>


            {/* ==================================================
                SUMMARY CARDS
            ================================================== */}

            <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                xl:grid-cols-4
                gap-6
            ">


                <Card

                    title="Total Reports"

                    value={totalReports}

                    icon={<FileText/>}

                    color="bg-green-600"

                />


                <Card

                    title="Completed Reports"

                    value={readyReports}

                    icon={<CheckCircle/>}

                    color="bg-blue-600"

                />


                <Card

                    title="Population Reports"

                    value={populationReports}

                    icon={<BarChart3/>}

                    color="bg-indigo-600"

                />


                <Card

                    title="Habitat Reports"

                    value={habitatReports}

                    icon={<TreePine/>}

                    color="bg-emerald-600"

                />

            </div>


            {/* ==================================================
                REPORT TYPE OVERVIEW
            ================================================== */}

            <div>

                <h2 className="
                    text-2xl
                    font-bold
                    mb-5
                ">

                    Report Categories

                </h2>


                <div className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-4
                    gap-5
                ">


                    <CategoryCard
                        title="Population"
                        count={populationReports}
                        icon={<BarChart3/>}
                        color="bg-blue-600"
                    />


                    <CategoryCard
                        title="Biodiversity"
                        count={biodiversityReports}
                        icon={<Leaf/>}
                        color="bg-green-600"
                    />


                    <CategoryCard
                        title="Habitat"
                        count={habitatReports}
                        icon={<TreePine/>}
                        color="bg-emerald-600"
                    />


                    <CategoryCard
                        title="Conservation"
                        count={conservationReports}
                        icon={<ShieldCheck/>}
                        color="bg-purple-600"
                    />


                </div>

            </div>


            {/* ==================================================
                REPORT LIST
            ================================================== */}

            <div className="
                space-y-5
            ">


                <div className="
                    flex
                    justify-between
                    items-center
                ">

                    <h2 className="
                        text-2xl
                        font-bold
                    ">

                        Generated Reports

                    </h2>


                    <span className="
                        text-sm
                        text-gray-500
                    ">

                        {reports.length} reports

                    </span>

                </div>


                {reports.length === 0 ? (

                    <div className="
                        bg-white
                        rounded-2xl
                        shadow-sm
                        border
                        p-12
                        text-center
                    ">

                        <FileText
                            size={50}
                            className="
                                mx-auto
                                text-gray-400
                                mb-4
                            "
                        />


                        <h2 className="
                            text-2xl
                            font-bold
                        ">

                            No Reports Found

                        </h2>


                        <p className="
                            text-gray-500
                            mt-2
                        ">

                            Generate your first wildlife
                            intelligence report.

                        </p>


                    </div>

                ) : (

                    reports.map(
                        report => (

                            <div

                                key={
                                    report.reportId
                                }

                                className="
                                    bg-white
                                    rounded-2xl
                                    shadow-sm
                                    border
                                    p-6
                                    flex
                                    flex-col
                                    lg:flex-row
                                    lg:justify-between
                                    lg:items-center
                                    gap-5
                                "
                            >


                                {/* REPORT INFO */}

                                <div className="
                                    flex
                                    gap-5
                                    items-center
                                ">


                                    <div className="
                                        p-4
                                        rounded-xl
                                        bg-green-100
                                        text-green-700
                                    ">

                                        <FileText/>

                                    </div>


                                    <div>

                                        <h3 className="
                                            text-xl
                                            font-bold
                                        ">

                                            {
                                                report.reportTitle
                                            }

                                        </h3>


                                        <div className="
                                            flex
                                            flex-wrap
                                            gap-5
                                            text-sm
                                            text-gray-500
                                            mt-2
                                        ">


                                            <span className="
                                                flex
                                                gap-1
                                                items-center
                                            ">

                                                <Calendar
                                                    size={15}
                                                />

                                                {
                                                    report.generatedAt
                                                        ? new Date(
                                                            report.generatedAt
                                                        ).toLocaleDateString()
                                                        : "-"
                                                }

                                            </span>


                                            <span className="
                                                flex
                                                gap-1
                                                items-center
                                            ">

                                                <User
                                                    size={15}
                                                />

                                                {
                                                    report.generatedByName
                                                }

                                            </span>


                                            <span>

                                                Survey:
                                                {" "}
                                                {
                                                    report.surveyName
                                                }

                                            </span>


                                            <span className="
                                                font-medium
                                                text-gray-700
                                            ">

                                                {
                                                    report.reportType
                                                }

                                            </span>


                                        </div>

                                    </div>

                                </div>


                                {/* ACTIONS */}

                                <div className="
                                    flex
                                    items-center
                                    gap-3
                                ">


                                    <span
                                        className={`
                                            px-4
                                            py-2
                                            rounded-full
                                            font-semibold
                                            text-sm
                                            ${
                                                report.reportStatus ===
                                                "FAILED"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-green-100 text-green-700"
                                            }
                                        `}
                                    >

                                        {
                                            report.reportStatus
                                        }

                                    </span>


                                    <button

                                        onClick={() =>
                                            handleDownload(
                                                report
                                            )
                                        }

                                        className="
                                            p-3
                                            rounded-xl
                                            bg-blue-100
                                            text-blue-700
                                            hover:bg-blue-200
                                        "
                                    >

                                        <Download
                                            size={18}
                                        />

                                    </button>


                                    <button

                                        onClick={() =>
                                            removeReport(
                                                report.reportId
                                            )
                                        }

                                        className="
                                            p-3
                                            rounded-xl
                                            bg-red-100
                                            text-red-600
                                            hover:bg-red-200
                                        "
                                    >

                                        <Trash2
                                            size={18}
                                        />

                                    </button>


                                </div>


                            </div>

                        )
                    )

                )}

            </div>


            {/* ==================================================
                GENERATE REPORT MODAL
            ================================================== */}

            {showModal && (

                <div className="
                    fixed
                    inset-0
                    z-50
                    bg-black/50
                    flex
                    items-center
                    justify-center
                    p-5
                ">


                    <div className="
                        bg-white
                        rounded-3xl
                        shadow-2xl
                        w-full
                        max-w-3xl
                        max-h-[90vh]
                        overflow-y-auto
                    ">


                        {/* MODAL HEADER */}

                        <div className="
                            flex
                            justify-between
                            items-center
                            p-6
                            border-b
                        ">


                            <div>

                                <h2 className="
                                    text-2xl
                                    font-bold
                                ">

                                    Generate Wildlife Report

                                </h2>


                                <p className="
                                    text-sm
                                    text-gray-500
                                    mt-1
                                ">

                                    Select a survey and report
                                    category.

                                </p>

                            </div>


                            <button

                                onClick={() =>
                                    setShowModal(false)
                                }

                                className="
                                    p-2
                                    rounded-xl
                                    hover:bg-gray-100
                                "
                            >

                                <X/>

                            </button>


                        </div>


                        <div className="
                            p-6
                            space-y-7
                        ">


                            {/* SURVEY */}

                            <div>

                                <label className="
                                    block
                                    font-semibold
                                    mb-2
                                ">

                                    Select Survey

                                </label>


                                <select

                                    value={
                                        selectedSurvey
                                    }

                                    onChange={e =>
                                        setSelectedSurvey(
                                            e.target.value
                                        )
                                    }

                                    className="
                                        w-full
                                        border
                                        rounded-xl
                                        px-4
                                        py-3
                                        outline-none
                                        focus:ring-2
                                        focus:ring-green-500
                                    "
                                >

                                    <option value="">

                                        Select a survey

                                    </option>


                                    {surveys.map(
                                        survey => (

                                            <option

                                                key={
                                                    survey.surveyId
                                                }

                                                value={
                                                    survey.surveyId
                                                }
                                            >

                                                {
                                                    survey.surveyName
                                                }

                                            </option>

                                        )
                                    )}

                                </select>

                            </div>


                            {/* REPORT TYPE */}

                            <div>

                                <label className="
                                    block
                                    font-semibold
                                    mb-3
                                ">

                                    Report Type

                                </label>


                                <div className="
                                    grid
                                    grid-cols-1
                                    md:grid-cols-2
                                    gap-4
                                ">


                                    {reportTypes.map(
                                        type => {

                                            const Icon =
                                                type.icon;


                                            const selected =
                                                selectedType ===
                                                type.value;


                                            return (

                                                <button

                                                    key={
                                                        type.value
                                                    }

                                                    type="button"

                                                    onClick={() =>
                                                        setSelectedType(
                                                            type.value
                                                        )
                                                    }

                                                    className={`
                                                        text-left
                                                        border-2
                                                        rounded-2xl
                                                        p-5
                                                        transition
                                                        ${
                                                            selected
                                                                ? "border-green-600 bg-green-50"
                                                                : "border-gray-200 hover:border-green-300"
                                                        }
                                                    `}
                                                >


                                                    <div className="
                                                        flex
                                                        items-center
                                                        gap-3
                                                        mb-3
                                                    ">


                                                        <div className={`
                                                            p-3
                                                            rounded-xl
                                                            text-white
                                                            ${type.color}
                                                        `}>

                                                            <Icon
                                                                size={20}
                                                            />

                                                        </div>


                                                        <h3 className="
                                                            font-bold
                                                        ">

                                                            {
                                                                type.label
                                                            }

                                                        </h3>

                                                    </div>


                                                    <p className="
                                                        text-sm
                                                        text-gray-500
                                                        leading-relaxed
                                                    ">

                                                        {
                                                            type.description
                                                        }

                                                    </p>


                                                </button>

                                            );

                                        }
                                    )}

                                </div>

                            </div>


                            {/* USER INFO */}

                            <div className="
                                bg-gray-50
                                rounded-2xl
                                p-4
                            ">

                                <p className="
                                    text-sm
                                    text-gray-500
                                ">

                                    Report will be generated by

                                </p>


                                <p className="
                                    font-semibold
                                    mt-1
                                ">

                                    {
                                        user?.fullName ||
                                        user?.email
                                    }

                                </p>


                                <p className="
                                    text-sm
                                    text-gray-500
                                ">

                                    {
                                        user?.role
                                    }

                                </p>

                            </div>


                            {/* BUTTONS */}

                            <div className="
                                flex
                                justify-end
                                gap-3
                                pt-2
                            ">


                                <button

                                    type="button"

                                    onClick={() =>
                                        setShowModal(false)
                                    }

                                    className="
                                        px-5
                                        py-3
                                        rounded-xl
                                        border
                                        hover:bg-gray-50
                                    "
                                >

                                    Cancel

                                </button>


                                <button

                                    onClick={
                                        handleGenerateReport
                                    }

                                    disabled={
                                        generating
                                    }

                                    className="
                                        px-6
                                        py-3
                                        rounded-xl
                                        bg-green-600
                                        text-white
                                        font-semibold
                                        hover:bg-green-700
                                        disabled:opacity-60
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    {generating && (

                                        <Loader2
                                            size={18}
                                            className="
                                                animate-spin
                                            "
                                        />

                                    )}


                                    {generating
                                        ? "Generating..."
                                        : "Generate Report"
                                    }

                                </button>


                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );

}


// ============================================================
// SUMMARY CARD
// ============================================================

function Card({
    title,
    value,
    icon,
    color
}: any) {

    return (

        <div className="
            bg-white
            rounded-2xl
            shadow-sm
            border
            p-6
            flex
            items-center
            gap-5
        ">


            <div className={`
                ${color}
                text-white
                p-4
                rounded-xl
            `}>

                {icon}

            </div>


            <div>

                <p className="
                    text-gray-500
                ">

                    {title}

                </p>


                <h2 className="
                    text-3xl
                    font-bold
                ">

                    {value}

                </h2>

            </div>


        </div>

    );

}


// ============================================================
// CATEGORY CARD
// ============================================================

function CategoryCard({
    title,
    count,
    icon,
    color
}: any) {

    return (

        <div className="
            bg-white
            rounded-2xl
            shadow-sm
            border
            p-5
            flex
            items-center
            gap-4
        ">


            <div className={`
                ${color}
                text-white
                p-3
                rounded-xl
            `}>

                {icon}

            </div>


            <div>

                <p className="
                    text-gray-500
                    text-sm
                ">

                    {title}

                </p>


                <p className="
                    text-2xl
                    font-bold
                ">

                    {count}

                </p>

            </div>


        </div>

    );

}