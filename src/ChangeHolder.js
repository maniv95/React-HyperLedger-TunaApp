/*eslint-disable*/
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import {Button} from 'reactstrap';
import history from './history';
import swal from 'sweetalert2';
class ChangeHolder extends Component {
    constructor(props){
        super(props);
        this.state = {
            key:'',
            Holder:''
        }
        this.onKey = this.onKey.bind(this);
        this.onHolder = this.onHolder.bind(this);
        this.onChangeHolder = this.onChangeHolder.bind(this);
    }
    onKey(a){
        this.setState({key: a.target.value});
    }
    onHolder(b){
        this.setState({Holder:b.target.value});
    }
    onChangeHolder(){
        try{
            let formBody = []
            formBody.push("key="+encodeURIComponent(this.state.key));
            formBody.push("holder="+encodeURIComponent(this.state.Holder));
            formBody = formBody.join("&");
            fetch("http://localhost:8080/api/ChangeHolder",{
                method: "post",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formBody
            })
            .then((res) => res.json())
            .then(data =>{
                console.log(data);
                swal.fire("Updated Holder","","success");
            })
        }
        catch(error){
            console.log(error);
        }
    }
    render(){
        return(
            <div className="App" align="center">
            <header className="App-Header">
            <h3>Change Holder</h3>
            </header>
            <label>Key</label><br/>
            <input type ="number" value={this.state.key} onChange={this.onKey}/>
            <br/>
            <label>Holder</label><br/>
            <input type ="text" value={this.state.holder} onChange={this.onHolder}/>
            <br/><br/>
            <Button onClick={this.onChangeHolder}>ChangeHolder</Button>
            <div align="right"><Button onClick={()=>this.props.history.push("/")}>Home</Button></div>
            </div>
        );
    }
}
export default withRouter(ChangeHolder);