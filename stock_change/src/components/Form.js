import React from 'react';
import DatePicker from "react-datepicker";
//import Button from 'react-bootstrap/Button';
import { Button } from 'semantic-ui-react';
import { Input } from 'semantic-ui-react'
// material table 
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
// datepicker
import {DateRangeInput, DateSingleInput, Datepicker} from '@datepicker-react/styled'

const axios = require('axios').default;

const useStyles = makeStyles({
    table: {
      minWidth: 650,
    },
  });

export default class Form extends React.Component {
    constructor(props){
        super(props);
        this.state={
            sDate: null,
            eDate: null,
            tsDate: null,
            teDate: null,
            ticker: '',
            totalAvg: 0,
            dataLoaded: false,
            currentPrice: 0,
            percentChange: 0,
            tickerRecords: []
        };

        let savedTickers = JSON.parse(localStorage.getItem('tickerRecords'));
        debugger;
        if(savedTickers != null){
            this.state.tickerRecords = savedTickers;
            this.state.sDate = savedTickers[0].sDate;
            this.state.eDate = savedTickers[0].eDate;
            this.state.tsDate = savedTickers[0].tsDate;
            this.state.teDate = savedTickers[0].teDate;
            this.state.dataLoaded = true;
        }
        
        debugger;
    }

    handleChangeTicker = ticker => {
        this.setState({
            ticker : ticker.target.value.toUpperCase()
        });
    };

    handleChangeStart = sDate => {

        let formattedDate = sDate.toISOString();        
        let tsDate = formattedDate.split('T')[0];

        this.setState({
            sDate : sDate,
            tsDate : tsDate
        });
    };

    handleChangeEnd = eDate => {        
        let formattedDate = eDate.toISOString();        
        let teDate = formattedDate.split('T')[0];

        this.setState({
            eDate : eDate,
            teDate: teDate
        });
    };

    submit = () => {    

        debugger;

        //if records exist 
        if(this.state.tickerRecords.length > 0){
            // if the current request's dates are different from the existing records
            if(this.state.tickerRecords[0].sDate !== this.state.sDate || this.state.tickerRecords[0].eDate !== this.state.eDate){
                // some modal prompt yes/no
                // **if they chose no then make sure state has correct dates. DatePicker will set date onChange

                // update entire table with new dates
                this.updateAllDateRanges();    
            }
            // subsequent calls with same dateRanges
            else{
                this.sendRequest();
            }
        }
        // initial call / this.state.tickerRecords null
        else{
            this.sendRequest();
        }
        //this.sendRequest();
    }

    //update all records with new dateranges
    updateAllDateRanges = () => {
        // clear storage. maybe do this after successfull request.
       // Storage.clear();

        let newTickerRecords = [];

        let self = this;
        // loop tickerRecords to get each ticker
        this.state.tickerRecords.forEach(function(item){
            axios.get(`https://cors-anywhere.herokuapp.com/https://api.tiingo.com/tiingo/daily/${item.ticker}/prices?token=ef09ed6da5356e421f5d39c0a98922744b5fc79b`)
            .then(response => {

                debugger;

                // save currentPrice in state to access in next promise. maybe we don't have to.
                self.setState({ currentPrice: response.data[0].close });
                return axios.get(`https://cors-anywhere.herokuapp.com/https://api.tiingo.com/tiingo/daily/${item.ticker}/prices?startDate=${self.state.tsDate}&endDate=${self.state.teDate}&format=json&resampleFreq=weekly&token=ef09ed6da5356e421f5d39c0a98922744b5fc79b`);
            })
            .then(response=> {
                debugger;

                let avg = 0;
                let sum= 0;
                // will execute when we get response from tingo
                response.data.forEach(function(item){
                    avg = (parseInt(item.high) + parseInt(item.low)) / parseInt(2);
                    sum += avg;
                    console.log('high: ' + item.high);
                    console.log('low: ' + item.low);
                    console.log('sum: ' + item.high + item.low);
                    console.log('avg: ' + avg);
                })
                
                let totalAvg = (sum /  response.data.length).toFixed(4);
    
                let diff, percentChange = 0;
                
                diff = self.state.currentPrice - totalAvg;
                percentChange = (diff / (parseInt(totalAvg)) * 100).toFixed(4);
            
                let record = {
                    ticker : item.ticker,
                    totalAvg : totalAvg,
                    currentPrice : self.state.currentPrice,
                    percentChange : percentChange,
                    sDate : self.state.sDate,
                    eDate : self.state.eDate,
                    tsDate : self.state.tsDate,
                    teDate: self.state.teDate
                };

                newTickerRecords.push(record);
            })
            
        });

        // clear storage
        //localStorage.clear();
        // save new tickerRecords in state and localstorage
        this.setState({tickerRecords: newTickerRecords});
        localStorage.setItem('tickerRecords', newTickerRecords);
    }


    sendRequest = () => {

        alert(`payLoad: ${this.state.ticker} \nstartDate: ${this.state.tsDate} \nendDate: ${this.state.teDate}`);
        
        axios.get(`https://cors-anywhere.herokuapp.com/https://api.tiingo.com/tiingo/daily/${this.state.ticker}/prices?token=ef09ed6da5356e421f5d39c0a98922744b5fc79b`)
        .then(response => {
            this.setState({ currentPrice: response.data[0].close });
            return axios.get(`https://cors-anywhere.herokuapp.com/https://api.tiingo.com/tiingo/daily/${this.state.ticker}/prices?startDate=${this.state.tsDate}&endDate=${this.state.teDate}&format=json&resampleFreq=weekly&token=ef09ed6da5356e421f5d39c0a98922744b5fc79b`);
        })
        .then(response => {
            let avg = 0;
            let sum= 0;
            // will execute when we get response from tingo
            response.data.forEach(function(item){
                avg = (parseFloat(item.high) + parseFloat(item.low)) / parseFloat(2);
                sum += avg;
                console.log('high: ' + item.high);
                console.log('low: ' + item.low);
                console.log('sum: ' + item.high + item.low);
                console.log('avg: ' + avg);
            })
            
            let totalAvg = (sum /  response.data.length).toFixed(4);

            let diff, percentChange = 0;
            
            diff = this.state.currentPrice - totalAvg;
            percentChange = (diff / (parseFloat(totalAvg)) * 100).toFixed(4);
        
            let record = {
                ticker : this.state.ticker,
                totalAvg : totalAvg,
                currentPrice : this.state.currentPrice,
                percentChange : percentChange,
                sDate : this.state.sDate,
                eDate : this.state.eDate,
                tsDate : this.state.tsDate,
                teDate: this.state.teDate
            };

            debugger;
            let tickerRecords = this.state.tickerRecords;
            
            tickerRecords.push(record);

            this.setState({
                    totalAvg, 
                    percentChange, 
                    tickerRecords,
                    dataLoaded: true
                });

            debugger;

            localStorage.setItem('tickerRecords', JSON.stringify(this.state.tickerRecords));
        })
        .catch(error => {
            console.log(error);
        });
    }
    

    render(){
        if(this.state.dataLoaded){
            return(
                <div className="containerBody">
                    <Input focus type="text" value={this.state.ticker} onChange={this.handleChangeTicker}></Input>
                    <DatePicker 
                        selected = {Date.parse(this.state.sDate)}
                        onChange = {this.handleChangeStart}
                    />
                    <DatePicker
                        selected = {Date.parse(this.state.eDate)}
                        onChange = {this.handleChangeEnd}
                    />
                    <Button 
                        primary
                        onClick={this.submit}
                    >poll
                    </Button>
    
                    <TableContainer component={Paper}>
                        <Table className={useStyles.table} aria-label="simple table">
                            <TableHead>
                            <TableRow>
                                <TableCell>TICKER</TableCell>
                                <TableCell align="right">AVG.</TableCell>
                                <TableCell align="right">CURRENT&nbsp;</TableCell>
                                <TableCell align="right">% CHANGE&nbsp;</TableCell>
                            </TableRow>
                            </TableHead>
                            <TableBody>
                            {this.state.tickerRecords.map((record, index) => ( // be aware using index as key**
                                <TableRow key={index}> 
                                    <TableCell component="th" scope="row">
                                        {record.ticker}
                                    </TableCell>
                                    <TableCell align="right">{record.totalAvg}</TableCell>
                                    <TableCell align="right">{record.currentPrice}</TableCell>
                                    <TableCell align="right">{record.percentChange}%</TableCell>
                                </TableRow>
                            ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            )
        }
        else{
            return (
            <div className="containerBody">
                <Input focus type="text" onChange={this.handleChangeTicker}></Input>
                <DatePicker 
                    selected = {Date.parse(this.state.sDate)}
                    onChange = {this.handleChangeStart}
                />
                <DatePicker
                    selected = {Date.parse(this.state.eDate)}
                    onChange = {this.handleChangeEnd}
                />
                <Button 
                    primary
                    onClick={this.submit}
                >poll
                </Button>
            </div>
            )
        }
        
    }
}