import React, { Component } from 'react';
import firebase from 'firebase/app';

import {Link} from 'react-router-dom';
import {Grid, Form, Segment, Button, Header, Message, Icon} from 'semantic-ui-react';
class Login extends Component {
    state = {
     
        email:'',
        password:'',
        
        errors: [],
        loading: false,
        
    }
    isFormEmpty = ({username, email, password, passwordConfirmation}) => {
        return !username.length || !email.length || !password.length || !passwordConfirmation.length
    }
    
    displayErrors = errors => errors.map((error, i) => <p key={i}>{error.message}</p>);
    handleChange = event => {
        this.setState({[event.target.name]:event.target.value});
    }
    isFormValid = ({email, password}) => email && password;
    handleSubmit = event => {
        event.preventDefault();
        if(this.isFormValid(this.state)){
            this.setState({errors: [], loading: true});
            firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password)
            .then(signedInUser =>{
                console.log("signedInUser"); 
            }).catch(error =>{
                console.log(error);
                this.setState({errors: this.state.errors.concat(error), loading: false})
            })
        }
    }
    
    



    handleInputError = (errors , inputname) => {
        return errors.some(error => error.message.toLowerCase().includes(inputname)) ? 'error' : '';
    }
    render() {
        const { email, password,  errors, loading} = this.state;
        return (
            <Grid textAlign="center" verticalAlign="middle" className="app">
                <Grid.Column style={{maxWidth: 450}}>
                    <Header as="h2" icon color="violet" textAlign="center">
                        <Icon name="code branch" color="violet" />
                        Login to DevChat
                    </Header>
                    <Form onSubmit={this.handleSubmit}  size="large">
                        <Segment stacked>
                            <Form.Input fluid name="email" icon="mail" iconPosition="left" placeholder="Email Address" className={this.handleInputError(errors, 'email')} onChange={this.handleChange} value={email}type="email"/>
                            <Form.Input fluid name="password" icon="lock" iconPosition="left" placeholder="Password" onChange={this.handleChange} className={this.handleInputError(errors, 'password')} value={password} type="password"/>
                            <Button disabled={loading} className={loading ? 'loading': ''} color="violet" fluid size="large">Submit</Button>
                        </Segment>
                    </Form>
                    {errors.length > 0 && (
                        <Message error>
                            <h3>Error</h3>
                            {this.displayErrors(errors)}
                        </Message>
                    )}
                    <Message>Don't have an account? <Link to="/register">Register</Link></Message>
                </Grid.Column>

            </Grid>  
        );
    }
}

export default Login;