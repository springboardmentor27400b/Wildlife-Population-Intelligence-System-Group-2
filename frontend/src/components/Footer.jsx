function Footer() {
	return (
		<footer className="app-footer">
			<div className="container d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
				<div>
					<strong>Wildlife AI</strong>
					<div className="app-footer__muted">
						Conservation analytics for protected ecosystems.
					</div>
				</div>

				<div className="app-footer__muted text-md-end">
					Built for wildlife intelligence, monitoring, and sustainable reporting.
				</div>
			</div>
		</footer>
	);
}

export default Footer;
