import React from 'react';
import {useFocusEffect} from '@react-navigation/native';
import Encryption from '../encryption_tools/encryption.js';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
// import {SearchBar} from 'react-native-elements';
var RNFS = require('react-native-fs');

export default function Home({route, navigation}) {
  const {password} = route.params;

  // const [search, setSearch] = React.useState('');

  const [refreshing, setRefreshing] = React.useState(false);
  const [data, setData] = React.useState({});
  const dataLoc = `${RNFS.DocumentDirectoryPath}/LocalPasswordStorageDATA`;

  // runs once for every focus
  useFocusEffect(
    React.useCallback(() => {
      //setSearch('');
      readFile();
    }, []),
  );

  const [modalVisible, setModalVisible] = React.useState(false);
  const [d, setD] = React.useState(false);

  async function readFile() {
    const fileUri1 = `${dataLoc}/user.txt`;
    const fileUri2 = `${dataLoc}/salt.txt`;

    const salt = await RNFS.readFile(fileUri2);
    const hashInfo = Encryption.hash(password, salt);
    var content = await RNFS.readFile(fileUri1);
    var dContent = Encryption.decrypt(content, hashInfo);
    var parsed = JSON.parse(dContent);
    if (parsed != data) {
      setData(parsed);
    }
  }

  function modal(d) {
    setModalVisible(true);
    setD(d);
  }

  /*
  async function searchBarFunc(text) {
    if (text == "") {
      readFile();
      setSearch(text);
      return;
    }
    setSearch(text);
    text = text.toLowerCase()
    var keyList = Object.keys(data);
    var newKeyList = []
    for (const item of keyList) {
      if (item.toLowerCase().includes(text)) {
        newKeyList.push(item)
      }
    }
    var newData = {}
    for (const item of newKeyList) {
      newData[item] = data[item]
    }
    setData(newData)
  }
  */

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <ScrollView
      automaticallyAdjustKeyboardInsets={true}
      contentContainerStyle={styles.container}
      style={{backgroundColor: '#da635d'}}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <TouchableOpacity
        style={styles.navButton}
        onPress={() => navigation.navigate('New', {password: password})}>
        <Text style={styles.nav}>&#xFF0B; New</Text>
      </TouchableOpacity>
      <Text style={styles.h1}>Saved Credentials</Text>
      <Text style={styles.p}>Click an account to see details.</Text>
      {/* 
      <View style={styles.searchBarS}>
        <TextInput
          style={styles.p}
          placeholder="Search Here..."
          placeholderTextColor="#f9f9f9ef" 
          round
          value={search}
          onChangeText={text => searchBarFunc(text)}
          autoCorrect={false}
          autoCapitalize={'none'}
        />
      </View>
      */}
      <ModalP
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
        data={data}
        d={d}
        navigation={navigation}
        password={password}
      />
      <View style={styles.p}></View>
      <View style={styles.p}></View>
      <Entry data={data} modal={x => modal(x)} />
      <View style={{marginVertical: 20}}></View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

export function Entry({data, modal}) {
  const rv = Object.keys(data)
    .sort()
    .map(d => (
      <TouchableOpacity key={d} style={styles.box} onPress={() => modal(d)}>
        <Text style={styles.boxP1}>{data[d].name}</Text>
        {/* 
      <Text style={styles.boxP2}>Username: {d.split('\n')[1]}</Text>
      <Text style={styles.boxP2}>Password: {d.split('\n')[2]}</Text>
      */}
      </TouchableOpacity>
    ));
  return rv;
}

export function ModalP({
  modalVisible,
  setModalVisible,
  data,
  d,
  navigation,
  password,
}) {
  function edit() {
    setModalVisible(false);
    navigation.navigate('Edit', {password: password, data: data, d: d});
  }

  if (modalVisible) {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.modalStyle}>
          <TouchableOpacity
            style={styles.close}
            onPress={() => setModalVisible(false)}>
            <Text style={styles.mnav}>&#x2715; Close</Text>
          </TouchableOpacity>
          <View style={styles.ebox}>
            <Text style={styles.boxEP1}>{data[d].name}</Text>
            <Text style={styles.boxEP2}>Username: {data[d].user}</Text>
            <Text style={styles.boxEP2}>Password: {data[d].pass}</Text>
          </View>
          <View style={styles.p}></View>
          <View style={styles.p}></View>
          <TouchableOpacity style={styles.close} onPress={() => edit()}>
            <Text style={styles.mnav}>&#x270E; Edit</Text>
          </TouchableOpacity>
          <View style={styles.h1}></View>
        </View>
      </Modal>
    );
  }
}

var {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#da635d',
    alignItems: 'center',
  },
  navButton: {
    alignSelf: 'flex-start',
    position: 'absolute',
    marginLeft: width * 0.75,
    marginTop: height * 0.061,
  },
  nav: {
    fontFamily: 'Helvetica',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    alignSelf: 'flex-start',
    position: 'absolute',
  },
  h1: {
    marginTop: height * 0.12,
    marginBottom: height * 0.02,
    marginHorizontal: width * 0.02,
    fontFamily: 'Helvetica',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 35,
    textAlign: 'center',
  },
  p: {
    marginVertical: height * 0.004,
    marginHorizontal: width * 0.05,
    fontFamily: 'Helvetica',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    textAlign: 'center',
  },
  buttonGroup: {
    marginTop: height * 0.05,
  },
  button: {
    marginVertical: height * 0.015,
    marginHorizontal: width * 0.05,
  },
  searchBarS: {
    marginVertical: height * 0.02,
    marginHorizontal: width * 0.01,
    paddingVertical: height * 0.006,
    width: width * 0.8,
    borderWidth: 4,
    borderStyle: 'solid',
    borderRadius: 1000,
    borderColor: '#fff',
  },
  box: {
    marginVertical: height * 0.01,
    marginHorizontal: width * 0.01,
    paddingVertical: height * 0.006,
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: 5,
    borderColor: '#fff',
    backgroundColor: '#4e4e56',
  },
  boxP1: {
    marginVertical: height * 0.004,
    marginHorizontal: width * 0.05,
    width: width * 0.65,
    fontFamily: 'Helvetica',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  boxP2: {
    marginVertical: height * 0.004,
    marginHorizontal: width * 0.05,
    width: width * 0.65,
    fontFamily: 'Helvetica',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'left',
  },
  modalStyle: {
    flexGrow: 1,
    flexDirection: 'column',
    backgroundColor: '#da635d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ebox: {
    flexDirection: 'column',
    marginHorizontal: width * 0.01,
    paddingVertical: height * 0.015,
    width: width * 0.8,
    height: height * 0.4,
    borderWidth: 3,
    borderStyle: 'solid',
    borderRadius: 5,
    borderColor: '#fff',
    backgroundColor: '#4e4e56',
  },
  boxEP1: {
    marginVertical: height * 0.015,
    marginHorizontal: width * 0.05,
    width: width * 0.65,
    fontFamily: 'Helvetica',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: 'center',
  },
  boxEP2: {
    marginVertical: height * 0.01,
    marginHorizontal: width * 0.05,
    width: width * 0.65,
    fontFamily: 'Helvetica',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 23,
    textAlign: 'left',
  },
  close: {
    marginBottom: height * 0.02,
    marginHorizontal: width * 0.02,
    textAlign: 'center',
  },
  mnav: {
    fontFamily: 'Helvetica',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 25,
    alignItems: 'center',
  },
});

// Colors: https://www.color-hex.com/color-palette/3307
