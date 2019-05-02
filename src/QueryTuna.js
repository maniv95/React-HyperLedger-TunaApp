/*eslint-disable*/
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import {Button, Table} from 'reactstrap';
import history from './history';
import swal from 'sweetalert2';
class QueryTuna extends Component{
    constructor(props){
        super(props);
        this.state = {
            data :[]
        }
        this.onQuery = this.onQuery.bind(this);
    }
    onQuery () {
        try{
            fetch('http://localhost:8080/api/QueryTuna')
            .then((res)=> res.json())
            .then(data =>{
                // console.log(data);
                if(data.code ==200){
                    var array = [];
                    for (var i = 0; i < data.query.length; i++){
                        parseInt(data.query[i].Key);
                        data.query[i].Record.Key = parseInt(data.query[i].Key);
                        array.push(data.query[i].Record);
                    }
                    array.sort(function(a, b) {
                        return parseFloat(a.Key) - parseFloat(b.Key);
                    });
                    // console.log(JSON.stringify(array));
                    this.setState({data: array})
                    swal.fire("Details Retrieved","","success");
                }
                else if(data.code ==201 || data.code ==400){
                    swal.fire("Error In Fetching Details","","error");
                }
            })
        }
        catch(error){
            console.log(error);
        }
    }
    render(){
      let TableData = this.state.data.map(value => {
                        // console.log(value.Key,value.holder,value.location,value.timestamp,value.vessel)
                        return (
                            <Table align="center" border="1">
                            <tbody>
                                <tr>
                                    <td>Key</td>
                                    <td>{value.Key}</td>
                                </tr>
                                <tr>
                                    <td>Holder</td>
                                    <td>{value.holder}</td>
                                </tr>
                                <tr>
                                    <td>Location</td>
                                    <td>{value.location}</td>
                                </tr>
                                <tr>
                                    <td>Timestamp</td>
                                    <td>{value.timestamp}</td>
                                </tr>
                                <tr>
                                    <td>Vessel</td>
                                    <td>{value.vessel}</td>
                                </tr>
                            </tbody>
                            </Table>
                        );
                    })
        return( 
            <div className="App" align="center">
            <header className="App-Header">
            <h3>Details of All Tuna(s)</h3>
            </header>
                <div>
                    <Button onClick={this.onQuery}>Query</Button>
                </div>
                <div>{TableData}</div>
                <div align="right"><Button onClick={()=>this.props.history.push("/")}>Home</Button></div>
            </div>
        );
    }
}
export default withRouter(QueryTuna);
