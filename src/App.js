/*eslint-disable*/
import React, { Component } from 'react';
import { BrowserRouter as Router, Route , Switch } from "react-router-dom";
import { withRouter } from 'react-router';
import AddTuna from './AddTuna';
import GetTuna from './GetTuna';
import QueryTuna from './QueryTuna';
import ChangeHolder from './ChangeHolder';
import LandingPage from './LandingPage';
import RegAdmin from './RegisterAdmin';
import RegUser from './RegisterUser'
import history from './history';
const all = () => (
  <div>
  <LandingPage/>
  </div>
)
const addTuna = () => (
  <div>
  <AddTuna/>
  </div>
)
const getTuna = () => (
  <div>
  <GetTuna/>
  </div>
)
const queryTuna = () => (
  <div>
  <QueryTuna/>
  </div>
)
const changeHolder = () => (
  <div>
  <ChangeHolder/>
  </div>
)
const regadmin = () => (
  <div>
  <RegAdmin/>
  </div>
)
const reguser = () => (
  <div>
  <RegUser/>
  </div>
)
class App extends Component {
  render() {
    return ( 
      <Switch>
        <Route exact path ="/" component ={all} />
        <Route  path = "/RegisterAdmin" component = {regadmin} />
        <Route  path = "/RegisterUser"  component = {reguser} />
        <Route  path = "/AddTuna"    component = {addTuna} />  
        <Route  path = "/GetTuna"    component = {getTuna} />
        <Route  path = "/QueryTuna"  component = {queryTuna} />
        <Route  path = "/ChangeHolder" component = {changeHolder} />
       </Switch> 
    )
  }
}
export default withRouter(App);
