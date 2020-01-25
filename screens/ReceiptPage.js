import React, { Component } from 'react';
import { FlatList,Alert, StyleSheet, TextInput, Text, View, Image, Button, TouchableOpacity} from 'react-native';
import firebase from 'firebase';
import { sha256} from 'js-sha256';
import SimpleCrypto from "simple-crypto-js";

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
    },
    input: {
        width: 200,
        height: 45,
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15
    },
    button: {
        alignItems: 'center',
        width: 150,
        padding: 10,
        borderRadius: 5,
        marginBottom: 15,
        backgroundColor: '#99ccff',
    },
    flat:{
        flex: 1,
          
    },
    item: {  
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,  
        height: 70,  
        width: 280,
        backgroundColor: '#ccc',
        borderColor: 'black',
        borderWidth: 1,
        marginVertical: 10,
        borderRadius: 10,
        
    },
});

export default class ReceiptPage extends Component {


    constructor(props) {
        super(props);
        const {navigation} = this.props;
        // get merchant ID and amount keyed in from previous screen
        this.state = {
            merchantID: this.props.navigation.getParam('merchantID'),
            amt: this.props.navigation.getParam('amountPayable'),
            email: this.props.navigation.getParam('email'),
            cardUsed: this.props.navigation.getParam('card'),
        };
        


    }


    remove_character(str_to_remove, str) {
        let reg = new RegExp(str_to_remove)
        return str.replace(reg, '')
    }


    reduction(email) {
        temp = sha256(email);
        for(i=0; i < 3;i++)
        {
          temp = sha256(temp.substring(0,32));
        }
        return temp;
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

        var date = new Date().getDate(); //Current Date
        var month = new Date().getMonth() + 1; //Current Month
        var year = new Date().getFullYear(); //Current Year
        var hours = new Date().getHours(); //Current Hours
        var min = new Date().getMinutes(); //Current Minutes
        var sec = new Date().getSeconds(); //Current Seconds


        console.log('\nDate : '+ date + '/' + month + '/' + year 
        + '\nTime : ' + hours + ':' + min + ':' + sec + '\nCard : '
        + '****   ****   ****   ' + this.state.cardUsed.substring(this.state.cardUsed.length-4,this.state.cardUsed.length)
        +'\nAmount : ' + this.state.amt + '\nPaid to : ' + this.state.merchantID);

        var temp = this.remove_character('@',this.state.email);
        var userEmail = temp.replace(/\./g, ''); 
        var DateText = date + '/' + month + '/' + year;
        var TimeText = hours + ':' + min + ':' + sec;

        var _secretKey = this.reduction(this.state.email);
 
        var simpleCrypto = new SimpleCrypto(_secretKey);

        firebase.database().ref('users/'+ userEmail+ '/Card/'+sha256(this.state.cardUsed)+'/Transactions/'+sha256(DateText+TimeText)).set(
            {
  
            //    date: simpleCrypto.encrypt(DateText),
            //    time: simpleCrypto.encrypt(TimeText),
            //    amount: simpleCrypto.encrypt(this.state.amt),
            //    paid: simpleCrypto.encrypt(this.state.merchantID),
                date: DateText,
                time: TimeText,
                amount: this.state.amt,
                paid: this.state.merchantID,
           }
          ).then(()=> {
            
            console.log('Transaction saved in db');
         
          
        }).catch((error) => {
    
        });
        
      }


  render () {

    if(this.state.loading) {
        console.log('im called');
        return null;
    }
    
    return (
        <View style={styles.container}>
            <Text>Card used : {this.state.cardUsed}</Text>
            <Text>Vendor Name:</Text>
            <Text>Merchant ID = {this.state.merchantID}</Text>
            <Text>Paid amount (S$): {this.state.amt}</Text>
            <TouchableOpacity style={styles.button} 
                onPress={()=>this.props.navigation.navigate('QRMain',{email: this.state.email})}>
                    <Text>Done</Text>
                </TouchableOpacity>
        </View>
        );
    }
}