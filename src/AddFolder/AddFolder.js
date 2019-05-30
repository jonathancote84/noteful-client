import React, { Component } from 'react'
import NotefulForm from '../NotefulForm/NotefulForm'
import ApiContext from '../ApiContext'
import config from '../config'
import ValidationError from '../ValidationError/ValidationError' 
import './AddFolder.css'


export default class AddFolder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      nameValid: false,
      formValid: false,
      validationMessages: {
        name: '',
      }
    } 
  }

  static defaultProps = {
    history: { 
      push: () => { }
    },
  }

  static contextType = ApiContext;

  canBeSubmitted() {
    const { formValid } = this.state;
    return (
      formValid === true
    );
  }
  

  updateName(name) {
    this.setState({name}, () => {this.validateName(name)});
  }

  handleSubmit = e => {
    e.preventDefault()
    const folder = {
      name: e.target['folder-name-input'].value
    }
    //submit values to server
    fetch(`${config.API_ENDPOINT}/folders`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify(folder),
    })
      .then(res => {
        if (!res.ok)
          return res.json().then(e => Promise.reject(e))
        return res.json()
      })
      .then(folder => {
        //callback for the addFolder function
        this.context.addFolder(folder)
        this.props.history.push(`/folder/${folder.id}`)
      })
      .catch(error => {
        console.error({ error })
      })
  }

  validateName(fieldValue) {
    const fieldErrors = {...this.state.validationMessages};
    let hasError = false;
    fieldValue = fieldValue.trim();
    if(fieldValue.length === 0) {
      fieldErrors.name = 'Name a folder';
      hasError = true;
    } else { 
      if (fieldValue.length < 2) {
        fieldErrors.name = 'Name must be at least 2 characters long';
        hasError = true;
      } else {
        fieldErrors.name = '';
        hasError = false;
      }  
    }
    this.setState({
      validationMessages: fieldErrors,
      nameValid: !hasError
    }, this.formValid );
  }

  formValid() {
    this.setState({
      formValid: this.state.nameValid
    });
  }

  render() {
    const isEnabled = this.canBeSubmitted();
    return (
      <section className='AddFolder'>
        <h2>Create a folder</h2>
        <NotefulForm onSubmit={this.handleSubmit}>
          <div className='field'>
            <label htmlFor='folder-name-input'>
              Name
            </label>
            <input type='text' id='folder-name-input' onChange={e => this.updateName(e.target.value)} />
            <ValidationError hasError={!this.state.nameValid} message={this.state.validationMessages.name}/>
          </div>
          <div className='buttons'>
            <button type='submit' disabled={!isEnabled} >
              Add folder
            </button>
          </div>
        </NotefulForm>
      </section>
    )
  }
}
