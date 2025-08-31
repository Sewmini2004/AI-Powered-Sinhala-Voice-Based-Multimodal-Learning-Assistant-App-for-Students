import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Alert, ScrollView } from 'react-native';
import Tts from 'react-native-tts';

export default function TTSReaderScreen() {
  const [text, setText] = useState<string>('');

  // Function to read the text aloud
  const readTextAloud = () => {
    if (text.trim()) {
      Tts.setDefaultLanguage('en-US');
      Tts.speak(text); 
    } else {
      Alert.alert('Error', 'Please enter some text to read aloud!');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🔊 Text-to-Speech</Text>
      <Text style={styles.instructions}>
        ඔබට අවශ්‍ය සටහන මෙතනට ටයිප් කරන්න හෝ පේස්ට් කරන්න.
      </Text>
      <TextInput
        style={styles.notepad}
        multiline
        value={text}
        onChangeText={setText}
        placeholder="ඔබේ සටහන මෙතනට ටයිප් කරන්න..."
      />

      <TouchableOpacity style={styles.readButton} onPress={readTextAloud}>
        <Text style={styles.buttonText}>කියවන්න</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructions: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  notepad: {
    width: '100%',
    minHeight: 200,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  readButton: {
    backgroundColor: '#4e73df',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});