import React from 'react';

const Header = () => {
	return (
		<nav className={'navbar navbar-inverse navbar-fixed-top Header'}>
			<div className="container">
				<div className="navbar-header">
					<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
						<span className="sr-only">Toggle navigation</span>
						<span className="icon-bar" />
						<span className="icon-bar" />
						<span className="icon-bar" />
					</button>
					<a className="navbar-brand">React test demo</a>
				</div>
			</div>
		</nav>
	);
};

export default Header;