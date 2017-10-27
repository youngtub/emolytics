import React from 'react';
import {Link} from 'react-router-dom';
import { Button, Modal, Form, FormGroup, FormControl, Row, Col, ControlLabel } from 'react-bootstrap';
import { DropdownButton, MenuItem } from 'react-bootstrap';
import axios from 'axios';
import OptionData from './OptionData.jsx';
import AddOption from '../create/addOption.jsx';
import EditPage from '../create/EditPage.jsx';
import AddCredits from './AddCredits.jsx';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as ChangeActions from '../../../actions';
import BellIcon from 'react-bell-icon';

class OptionListEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state ={
      date: '',
      total: 0,
      perView: 0,
      notEnoughCredits: false
    };
    this.revealAddOption = this.revealAddOption.bind(this);
    this.updateTotal = this.updateTotal.bind(this);
    this.updatePerView = this.updatePerView.bind(this);
    this.submitCredits = this.submitCredits.bind(this);
    this.showNotifications = this.showNotifications.bind(this);
  }

  componentDidMount() {
    axios.get('/api/getTestersForOption', { params: { optionId: this.props.option.id }})
      .then((testerIds) => {
        this.props.concatTesters(testerIds.data, this.props.index);
      })
      .catch((err) => {
        console.log('Error retrieving testers for option', err);
      });
  }

  revealAddOption() {
    this.setState({
      showAddOption: !this.state.showAddOption
    });
  }

  updateTotal(e) {
    if(e.target.value > this.props.loggedInUser.credits) {
      this.setState({
        notEnoughCredits: true
      })
    } else {
      this.setState({
        notEnoughCredits: false,
        total: e.target.value
      })
    }
  };

  updatePerView(e) {
    this.setState({
      perView: e.target.value
    })
  };

  submitCredits(e) {
    console.log('submitttting');
    e.preventDefault();
    let body = {
      optionId: this.props.option.id,
      total: this.state.total,
      perView: this.state.perView
    };
    axios.post('/api/addCreditsToOption', body)
    .then((res)=>{
      // console.log('res from addCreditsToOption', res)
      this.setState({
        showAddCredits: false
      })
    })
    .then(()=>{
      //deduce points from user total
      axios.post('/api/addCredits', {
        amount: -this.state.total
      })
      .then((res)=>{
        // console.log('res from deducting credits from user', res);
        let credits = this.props.loggedInUser.credits - this.state.total;
        this.props.actions.setCredits(credits); // Redundant on first login
        this.setState({
          total: 0,
          perView: 0
        })
      })
    })
  }

  showNotifications(option) {
    // console.log('Notifications to display', notifsArray)
    this.props.showNotifsCb(option)
  }

  render() {
    const containerStyle = {
      display: 'grid',
      gridTemplateColumns: '13vh 4vh',
      gridTemplateRows: '100%'
    };

    const details =  {
      gridColumn: '1',
      gridRow: '1'
    }

    const notifs =  {
      gridColumn: '2',
      gridRow: '1',
      float: 'right'
    }

    //optionListEntry is grid with 2 columns (80/20)
      // 1st div in column 1 (img, details)
      // 2nd div in column 2 (jut BellIcon)

    return (
      <div>
        { this.props.option !== 'End'  ? (
          <div className="currentSectionOptionListEntry" onClick={() => this.props.onOptionClick(this.props.index)}>
            <div className="optionListEntry" style={containerStyle}>

              <div style={notifs}>
              { this.props.notifications.length > 0 ? (
                <div onClick={() => {this.showNotifications(this.props.option)}}>
                  <BellIcon height='20' width='20' />
                  <a>{this.props.notifications[0].count || 0}</a>
                </div>
              ) : ''}
              </div>

              <div style={details}>
                <img className="optionListThumbnail" src={this.props.option.thumbnail} alt=""/>
                <p className="closerText">{this.props.option.name}</p>
                <p className="closerText">{this.props.option.description}</p>
              </div>
              {/* <p>Created On: {this.state.date = new Date(this.props.option.createdAt.slice(0, 19)).toString().slice(0, 24)}</p> */}
            </div>
            {/* <OptionData data={this.props.optionData}/> */}
            <Button onClick={() => this.props.beginEdit(this.props.option)}>Option Settings</Button>
          </div>
        ) : (
          <div onClick={this.revealAddOption} className="currentSectionOptionListEntry">
            <div className="optionListEntry">
              <h1>+</h1> {/* Style this later */}
            </div>
          </div>
        )}
        <Modal bsSize="large" show={this.state.showAddOption} onHide={this.revealAddOption}>
          <Modal.Header closeButton>
            <Modal.Title>Add an Option</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <AddOption
              close={this.revealAddOption}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.revealAddOption}>Close</Button>
          </Modal.Footer>
        </Modal>

        <Modal bsSize="large" show={this.props.showEdit} onHide={this.props.toggleEdit}>
          <Modal.Header closeButton>
            <Modal.Title>Edit this Option</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <EditPage
              close={this.props.toggleEdit}
              toEdit={'Option'}
            />
            <AddCredits
              notEnoughCredits={this.state.notEnoughCredits}
              submitCredits={this.submitCredits}
              updateTotal={this.updateTotal}
              updatePerView={this.updatePerView}
              credits={this.props.loggedInUser.credits}
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.props.toggleEdit}>Close</Button>
            <Button onClick={this.props.deleteOption}>Delete this Option</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const errorStyle = {
  textAlign: "center",
  color: "red",
  fontWeight: "bold"
}

const mapStateToProps = (state) => ({
  router: state.router,
  currentSection: state.currentSection,
  loggedInUser: state.loggedInUser
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ChangeActions, dispatch)
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(OptionListEntry);
