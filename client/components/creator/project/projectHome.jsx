import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import SectionList from './SectionList.jsx';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import * as ChangeActions from '../../../actions';
import axios from 'axios';

class ProjectHome extends React.Component {
  constructor(props) {
    super(props);
    this.onSectionClick = this.onSectionClick.bind(this);
    this.deleteSection = this.deleteSection.bind(this);
  }

  onSectionClick(obj, options) {
    obj['options'] = options;
    this.props.actions.changeCurrentSection(obj, options);
  }

  deleteSection(id) {
    this.props.currentProject.sections = this.props.currentProject.sections.filter((section) => {
      if (section.id !== id) {
        return section;
      }
    });
    this.props.actions.changeCurrentProject(this.props.currentProject);
    axios.delete('/api/deleteSection', { params: {sectionId: id} })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log('Error deleting section', error);
    })
  }

  render() {
    return (
      <div className="projectHomeContainer">
        <h2>Project Title: {this.props.currentProject.name}</h2>
        <h4>Project Description: {this.props.currentProject.description}</h4>
        <Link to="/addSection">
          <Button className="addSectionButton">Add a section</Button>
        </Link>
        <div>
          {this.props.currentProject.sections.map((section, i) => (
            <SectionList
              onSectionClick={this.onSectionClick}
              deleteSection={this.deleteSection}
              section={section}
              key={i}
            />
          ))}
        </div>
      </div>
    );
  }

}

const mapStateToProps = (state) => {
  // console.log('LOG WITHIN PROJECTHOME', state);
  return ({
    router: state.router,
    currentProject: state.currentProject
  });
};

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(ChangeActions, dispatch)
});


export default withRouter(connect(
  mapStateToProps,
  mapDispatchToProps
) (ProjectHome));
