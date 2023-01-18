import React, {Component} from 'react';
import {Link, NavLink} from 'react-router-dom';
import {Badge, DropdownItem, DropdownMenu, DropdownToggle, Nav, NavItem} from 'reactstrap';
import PropTypes from 'prop-types';

import {AppAsideToggler, AppHeaderDropdown, AppNavbarBrand, AppSidebarToggler} from '@coreui/react';
import logo from '../../assets/img/brand/logo.png'
import sygnet from '../../assets/img/brand/sygnet.png'

const propTypes = {
	children: PropTypes.node,
};

const defaultProps = {};

class DefaultHeader extends Component {
	render() {

		let loginData = JSON.parse(localStorage.getItem('login-data'));
		let userName = '';
		if (loginData != null) {
			userName = loginData.login;
		}

		// eslint-disable-next-line
		const {children, ...attributes} = this.props;

		return (
			<React.Fragment>
				<AppSidebarToggler className="d-lg-none" display="md" mobile/>
				<AppNavbarBrand
					full={{src: logo, width: 89, height: 25, alt: 'CoreUI Logo'}}
					minimized={{src: sygnet, width: 30, height: 30, alt: 'CoreUI Logo'}}
				/>
				<AppSidebarToggler className="d-md-down-none" display="lg"/>
				<Nav className="ml-auto" navbar>
					<AppHeaderDropdown direction="down">
						{/*<DropdownToggle nav>*/}
							{/*<i className="icon-bell"></i><Badge pill color="danger">2</Badge>*/}
						{/*</DropdownToggle>*/}
						{/*<DropdownMenu right style={{right: 'auto'}}>*/}
							{/*<DropdownItem header tag="div" className="text-center"><strong>Notificações</strong></DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-bell-o"></i> A licitação X foi alterada</DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-envelope-o"></i> Seu pagamento está atrasado em X dias</DropdownItem>*/}
						{/*</DropdownMenu>*/}
					</AppHeaderDropdown>
					<AppHeaderDropdown direction="down">
						<DropdownToggle nav>
							<span className="user-name">{userName}</span><i className="fa fa-chevron-down"></i>
						</DropdownToggle>
						<DropdownMenu right style={{right: 'auto'}}>
							{/*<DropdownItem header tag="div"*/}
										  {/*className="text-center"><strong>Account</strong></DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-bell-o"></i> Updates<Badge*/}
								{/*color="info">42</Badge></DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-envelope-o"></i> Messages<Badge color="success">42</Badge></DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-tasks"></i> Tasks<Badge*/}
								{/*color="danger">42</Badge></DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-comments"></i> Comments<Badge*/}
								{/*color="warning">42</Badge></DropdownItem>*/}
							{/*<DropdownItem header tag="div" className="text-center"><strong>Settings</strong></DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-user"></i> Profile</DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-wrench"></i> Settings</DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-usd"></i> Pagamentos<Badge color="secondary">42</Badge></DropdownItem>*/}
							{/*<DropdownItem><i className="fa fa-file"></i> Projects<Badge*/}
								{/*color="primary">42</Badge></DropdownItem>*/}
							{/*<DropdownItem divider/>*/}
							{/*<DropdownItem><i className="fa fa-shield"></i> Lock Account</DropdownItem>*/}
							<DropdownItem onClick={e => this.props.onLogout(e)}><i className="fa fa-lock"></i> Logout</DropdownItem>
						</DropdownMenu>
					</AppHeaderDropdown>
				</Nav>
				{/*<AppAsideToggler className="d-md-down-none"/>*/}
				{/*<AppAsideToggler className="d-lg-none" mobile />*/}
			</React.Fragment>
		);
	}
}

DefaultHeader.propTypes = propTypes;
DefaultHeader.defaultProps = defaultProps;

export default DefaultHeader;
