import React, { useState, useEffect, useReducer } from 'react';
import { Button } from 'semantic-ui-react';
import { Input } from 'semantic-ui-react';
import DatePicker from "react-datepicker";

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
//import {Datepicker, START_DATE} from '@datepicker-react/styled'

export default function FunctionalForm()
{
    const axios = require('axios').default;
    const [ticker, setTicker] = useState(null);
    //const [currentPrice, setCurrentPrice] = useState(parseFloat(0));
    const [currentPrice, setCurrentPrice] = useState(666);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [tingoStartDate, setTingoStartDate] = useState(null);
    const [tingoEndDate, setTingoEndDate] = useState(null);

    const [totalAvg, setTotalAvg] = useState(parseFloat(0));
    const [percentChange, setPercentChange] = useState(parseFloat(0));
    const [tickerRecords, setTickerRecords] = useState([]);
    const [dataLoaded, setDataLoaded] = useState(false);



    // table styling
    const useStyles = makeStyles({
        table: {
        minWidth: 650,
        },
    });

    const initialState = {
        startDate: null,
        endDate: null,
        focusedInput: null,
    }
    
    function reducer(state, action) {
        switch (action.type) {
            case 'focusChange':
            return {...state, focusedInput: action.payload}
            case 'dateChange':
            return action.payload
            default:
            throw new Error()
        }
    }
    

    const [state, dispatch] = useReducer(reducer, initialState)


    function sendRequest(){

        //alert(`payLoad: ${ticker} \nstartDate: ${startDate} \nendDate: ${endDate}`);
        alert(`startDate: ${state.startDate} \nendDate: ${endDate}`);

        axios.get(`https://cors-anywhere.herokuapp.com/https://api.tiingo.com/tiingo/daily/${ticker}/prices?token=ef09ed6da5356e421f5d39c0a98922744b5fc79b`)
        .then(response => {
            //this.setState({ currentPrice: response.data[0].close });
            
            // sets to 0
            //setCurrentPrice(parseFloat(response.data[0].close));
            
            let what = response.data[0].close;
            //setCurrentPrice(response.data[0].close);

            setCurrentPrice(parseFloat(what));

            debugger;
            //alert(currentPrice);
            return axios.get(`https://cors-anywhere.herokuapp.com/https://api.tiingo.com/tiingo/daily/${ticker}/prices?startDate=${startDate}&endDate=${endDate}&format=json&resampleFreq=weekly&token=ef09ed6da5356e421f5d39c0a98922744b5fc79b`);
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
            debugger;
            //diff = this.state.currentPrice - totalAvg;
            diff = currentPrice - totalAvg;
            percentChange = (diff / (parseFloat(totalAvg)) * 100).toFixed(4);
        
            let record = {
                //ticker : this.state.ticker,
                ticker: ticker,
                totalAvg : totalAvg,
                //currentPrice : this.state.currentPrice,
                currentPrice : currentPrice,
                percentChange : percentChange,
                // sDate : this.state.sDate,
                // eDate : this.state.eDate,
                // tsDate : this.state.tsDate,
                // teDate: this.state.teDate
                startDate: startDate,
                endDate : endDate,
                //tingoStartDate: tingoStartDate,
                //tingoEndDate: tindoEndDate
            };

            debugger;
            let _tickerRecords = tickerRecords;
            
            _tickerRecords.push(record);

            // this.setState({
            //         totalAvg, 
            //         percentChange, 
            //         tickerRecords,
            //         dataLoaded: true
            //     });

            setTotalAvg(totalAvg);
            setPercentChange(percentChange);
            setTickerRecords(_tickerRecords);
            setDataLoaded(true);

            debugger;

            localStorage.setItem('tickerRecords', JSON.stringify(this.state.tickerRecords));
        })
        .catch(error => {
            console.log(error);
        });
    }

    return (
        <div className="containerBody">
                <Input focus type="text" onChange={(e) => setTicker(e.target.value.toUpperCase())}></Input>
                {/* <DatePicker 
                    selected = {Date.parse(startDate)}
                    onChange = {(e) => { 
                        let formattedDate = e.toISOString();
                        setStartDate(formattedDate.split('T')[0]);
                    }}
                />
                <DatePicker
                     selected = {Date.parse(endDate)}
                    onChange = {(e) => {
                        let formattedDate = e.toISOString();
                        setEndDate(formattedDate.split('T')[0]);
                    }}
                /> */}

                <DateRangeInput
                    onDatesChange={data => dispatch({type: 'dateChange', payload: data})}
                    onFocusChange={focusedInput => dispatch({type: 'focusChange', payload: focusedInput})}
                    startDate={state.startDate} // Date or null
                    endDate={state.endDate} // Date or null
                    focusedInput={state.focusedInput} // START_DATE, END_DATE or null
                    />

                <Button 
                    primary
                    //onClick={this.submit}
                    onClick={() => sendRequest()}
                >poll
                </Button>
                    
                {/* <FunctionalTable></FunctionalTable>     */}
                {dataLoaded}{
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
                        {tickerRecords.map((record, index) => ( // be aware using index as key**
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
                }
                
        </div>
    )
}
