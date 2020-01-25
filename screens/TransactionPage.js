import React, { Component } from 'react';
import {StyleSheet, Text, View, Alert, Picker, SectionList, Platform, Button} from 'react-native';  
import firebase from 'firebase';
import SimpleCrypto from "simple-crypto-js";
import { sha256, sha224 } from 'js-sha256';
import { TouchableOpacity } from 'react-native-gesture-handler';



const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },  
    flat:{
        flex: 1,
          
    },
    item: {  
        alignItems: 'center',
        justifyContent: 'center', 
        height: 180,  
        width: 300,
        marginVertical: 10,
        
    },  
    listItem: {
        padding: 10,
        marginVertical: 10,
        backgroundColor: '#ccc',
        borderColor: 'black',
        borderWidth: 1
    },
    button: {
        alignItems: 'center',
        width: 150,
        padding: "5%",
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#99ccff',
    },
    SectionHeaderStyle:{
 
        backgroundColor : 'skyblue',
        fontSize : 20,
        padding: 5,
        color: 'white',
        borderRadius: 3,
      },
     
      SectionListItemStyle:{
     
        fontSize : 17,
        marginVertical: 5,
        backgroundColor : '#F5F5F5',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: 'black',
     
      },
});



export default class WalletOverview extends Component {

    

    constructor(props) {
        super(props);
        const {navigation} = this.props;
        this.state = {
            duration: 1,
            card:"5555 5555 5555 4444",
            email: "scarvion@gmail.com",
            loading: true,
            called: false,
            ThreeMonths: [],
            FirstMonth: [],
            SecondMonth: [],
            ThirdMonth: [],
            CardsAvailable: [],

        }
        console.log('Email used ' + this.state.email);
    }  


    remove_character(str_to_remove, str) {
        let reg = new RegExp(str_to_remove)
        return str.replace(reg, '')
    }

    get_Month(month)
    {
        if(month == 1)
        return 'January';
        else if(month == 2)
        return 'Febuary';
        else if(month == 3)
        return 'March';
        else if(month == 4)
        return 'April';
        else if(month == 5)
        return 'May';
        else if(month == 6)
        return 'June';
        else if(month == 7)
        return 'July';
        else if(month == 8)
        return 'August';
        else if(month == 9)
        return 'September';
        else if(month == 10)
        return 'October';
        else if(month == 11)
        return 'November';
        else  
        return 'December';
    } 

    SortByTiming = (MonthSet) => {
        tempMonth = [];
        while(MonthSet.length != 0)
        {
            var largest = MonthSet[0].totalSeconds;
            var index = 0;
            for(i =0; i < MonthSet.length;i++)
            {
                if(MonthSet[i].totalSeconds > largest)
                {
                    largest = MonthSet[i].totalSeconds;
                    index = i;
                }
            }
            tempMonth.push(MonthSet[index]);
            MonthSet.splice(index,1);
        }
        return tempMonth;
    }

    SortByMonths = () => {
        // console.log(this.state.ThreeMonths[2].mnth + "//" + this.state.ThreeMonths[2].yr)
        // console.log(DATA3[0].month + "||" + this.DATA3[0].year);
        for(i =0; i < this.state.ThreeMonths.length;i++)
        {
            for(j =0; j < DATA3.length;j++)
            {
                //Push to first month
                if(i == 0)
                {
                    if(DATA3[j].month == this.state.ThreeMonths[0].month && DATA3[j].year == this.state.ThreeMonths[0].year)
                    {
                        this.state.FirstMonth.push(DATA3[j]);
                    }
                }
                else if(i == 1)
                {
                    if(DATA3[j].month == this.state.ThreeMonths[1].month && DATA3[j].year == this.state.ThreeMonths[1].year)
                    {
                        this.state.SecondMonth.push(DATA3[j]);
                    }
                }
                else if(i == 2)
                {
                    if(DATA3[j].month == this.state.ThreeMonths[2].month && DATA3[j].year == this.state.ThreeMonths[2].year)
                    {
                        this.state.ThirdMonth.push(DATA3[j]);
                    }
                }


            }
        }
    }
    
    Get3months = () => {
        var month = 1; //Current Month
        var year = new Date().getFullYear(); //Current Year
        Months = [];
        currDate = {month: month,year: year};
            Months.push(currDate);
        // pushing the next 2 months depending on conditions
        for(i=0; i < 2;i++)
        {
            month--;
            //if current month is january the prev 2 months will be dec and nov
            if(month == 0)
            {
                month = 12;
                year--;
            }
            currDate = {month: month,year: year};
            Months.push(currDate);
        }
        // for(i =0; i < Months.length;i++)
        // {
        //     console.log(Months[i].month + "/" + Months[i].year);
        // }
        this.state.ThreeMonths = Months;
        
    }

    SortbyDate = () => {

        tempData = [];
        while(DATA3.length != 0)
        {
            var largest = (DATA3[0].year*365) + (DATA3[0].month*30) + (DATA3[0].day*1);
            var index = 0;
            for(i =0; i < DATA3.length;i++)
            {
                var curr = (DATA3[i].year*365) + (DATA3[i].month*30) + (DATA3[i].day*1);
                if(curr > largest)
                {
                    largest = curr;
                    index = i;
                }

            }
            tempData.push(DATA3[index]);
            DATA3.splice(index,1);
        }
        // for(i=0; i < tempData.length;i++)
        // console.log(tempData[i].year);
        DATA3 = tempData;
    }

    DATA3 =[];

    getCards = () => {
        var temp = this.remove_character('@',this.state.email);
        var userEmail = temp.replace(/\./g, ''); 

        var _secretKey = this.reduction(this.state.email);
 
        var simpleCrypto = new SimpleCrypto(_secretKey);

        Cards = []
        firebase.database().ref('users/'+ userEmail+ '/Card')
        .once('value',function(snapshot){

            snapshot.forEach(function(child) {
                 
                child.forEach(function(stuff) {
                    if(stuff.key == 'cardno')
                    {
                        Cards.push(simpleCrypto.decrypt(stuff.val()));
                    }
                })
                
              });
        }.bind(this)).then(() => {
           
            this.state.CardsAvailable = Cards;
            this.setState({loading: false})
         });

    }
   
    getTransactions = () =>{
        console.log('im running');
        var temp = this.remove_character('@',this.state.email);
        var userEmail = temp.replace(/\./g, ''); 

        var _secretKey = this.reduction(this.state.email);
 
        var simpleCrypto = new SimpleCrypto(_secretKey);
        DATA3 =[];
        this.state.FirstMonth = [];
        this.state.SecondMonth = [];
        this.state.ThirdMonth = [];
        firebase.database().ref('users/'+ userEmail+ '/Card/'+sha256(this.state.card)+'/Transactions')
        .once('value',function(snapshot){
            data = {amount:'',name:'',day:'',month:'',year:'',totalSeconds:'',paid:''};
            snapshot.forEach(function(child) {
                 
                child.forEach(function(stuff) {
                   if(stuff.key == 'amount')
                   {
                    // data.amount = simpleCrypto.decrypt(stuff.val());
                       data.amount = stuff.val();
                   }
                   else if(stuff.key == 'date')
                   {
                    //var date = simpleCrypto.decrypt(stuff.val());
                       var date = stuff.val();
                       var array = date.split("/");
                       data.day = array[0];
                       data.month = array[1];
                       data.year = array[2];
                       
                   }
                   else if(stuff.key == 'paid')
                   {
                       //data.merchant = simpleCrypto.decrypt(stuff.val());
                       data.merchant = stuff.val();
                   }
                   else if(stuff.key == 'time')
                   {
                    // var time = simpleCrypto.decrypt(stuff.val());
                       var time = stuff.val();
                       var array = time.split(":");
                       data.totalSeconds = (array[0]*60*60) + (array[1]*60) + (array[2]*1)
                   }
                })
                DATA3.push(data);
                data = {amount:'',name:'',day:'',month:'',year:'',totalSeconds:'',paid:''};
              });
        }.bind(this)).then(() => {
           this.SortbyDate();
           this.Get3months();
           this.SortByMonths();
           this.state.FirstMonth = this.SortByTiming(this.state.FirstMonth);
           this.state.SecondMonth = this.SortByTiming(this.state.SecondMonth);
           this.state.ThirdMonth = this.SortByTiming(this.state.ThirdMonth);
            this.setState({loading: false,called: false});
         });
    }

   componentDidUpdate(){
       console.log("loading");
       if(this.state.loading == true && this.state.called == false)
        {
            this.getTransactions();
        }
   }
    
    componentWillMount() {
        var config = {
          apiKey: "AIzaSyDwNT6z_uPTNkYpup_E8uQjZ-0_PYDT4QM",
          authDomain: "aspdatabase-7458c.firebaseapp.com",
          databaseURL: "https://aspdatabase-7458c.firebaseio.com",
          projectId: "aspdatabase-7458c",
          storageBucket: "aspdatabase-7458c.appspot.com",
          messagingSenderId: "974951413468",
          appId: "1:974951413468:web:a0d27cbba22d508f51e619",
          measurementId: "G-W02TZC7QT6"
        };
        if(!firebase.apps.length) {
          firebase.initializeApp(config);
        }

        this.getCards();
        this.getTransactions();
    }

    selectionlist = (duration) =>{
        console.log("Card is " + this.state.card);
       
        var currMonth = new Date().getMonth() + 1; //Current Month
        var PreviousMonth = currMonth - 1;// month before current month
        // if the current month is january
        if(PreviousMonth == 0){
            PreviousMonth = 12;
        }
        var thirdPrev = PreviousMonth -1;// month before the 2nd prev month
        //console.log('duration : '+this.state.duration);
        if(duration == 1)
        {
            return([
                {data: this.state.FirstMonth, title: this.get_Month(currMonth)},
              ])
        }
        else if(duration == 2)
        {
            
            return([
                {data: this.state.FirstMonth, title: this.get_Month(currMonth)},
                {data: this.state.SecondMonth, title: this.get_Month(PreviousMonth)},
              ])
        }
        else if(duration == 3)
        {
            return([
                {data: this.state.FirstMonth, title: this.get_Month(currMonth)},
                {data: this.state.SecondMonth, title: this.get_Month(PreviousMonth)},
                {data: this.state.ThirdMonth, title: this.get_Month(thirdPrev)},
              ])
        }
        
    }
    
      reduction(email){
        temp = sha256(email);
        for(i=0; i < 3;i++)
        {
          temp = sha256(temp.substring(0,32));
        }
        return temp;
      }

     
      
    

    render() {
      
        if(this.state.loading) {
            console.log('im called'); 
            return null;
         }

        return(
            <View style={styles.container}>  
                     {/* <Text style={{fontSize:17, fontWeight: 'bold', paddingLeft: '10%'}}> 
                      { 'Transaction Filter'}
                   </Text> */}
                   <View style={{paddingTop: "10%",width:'100%', backgroundColor: 'white', flexDirection: 'row'}}>
                        <Picker
                            selectedValue={this.state.duration}
                            onValueChange={(itemValue) => this.setState({duration: itemValue})}
                            style = {{width: '40%', marginLeft: '10%'}}
                            mode="dropdown">
                            <Picker.Item label="1 Month" value="1"/>
                            <Picker.Item label="2 Month" value="2"/>
                            <Picker.Item label="3 Month" value="3"/>
                        </Picker> 
                        <Picker style={{alignContent: 'flex-end'}}
                            selectedValue={this.state.card}
                            onValueChange={(itemValue) => this.setState({card: itemValue,loading: true})}
                            style = {{width: '40%', paddingLeft: 30}}
                            mode="dropdown">
                            {this.state.CardsAvailable.map(acct => <Picker.Item key={acct} label={acct.substring(acct.length-4)} value={acct} />)}
                        </Picker>
                   </View>  
                        <TouchableOpacity style={styles.button}>
                            <Text style={{fontSize:15}}>Refresh</Text>
                        </TouchableOpacity>
                    
                   
               <View style={{width: "94%",paddingBottom: "30%"}}>
                    <SectionList
                        style={{backgroundColor: 'white',width: '94%',paddingBottom: "20%",paddingLeft:'3%'}}
                        sections={this.selectionlist(this.state.duration)}
                        renderSectionHeader={ ({section}) => <Text style={styles.SectionHeaderStyle}> { section.title } </Text> }
                        renderItem={ ({item}) => <Text style={styles.SectionListItemStyle}>
                            <Text style={{fontSize: 13}}>
                                {item.day + "-" + this.get_Month(item.month) + "-" + item.year + "\n "}
                            </Text>
                            { item.merchant + '\n ' + item.amount} </Text> }
                        
                        keyExtractor={ (item, index) => index }
                    
                    />
                </View> 
            </View>
        );
             
    }
    

}