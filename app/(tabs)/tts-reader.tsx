import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';

// Replace with your backend URL
const BACKEND_URL = 'http://192.168.43.114:3000';

export default function TTSReaderScreen() {
  const [text, setText] = useState('');
  const [sound, setSound] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Unload sound when the component is unmounted or a new sound is played
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const readTextAloud = async () => {
    if (text.trim()) {
      setIsLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        const data = await response.json();

        if (data.status === 'success' && data.audioUrl) {
          const { sound: newSound } = await Audio.Sound.createAsync(
            { uri: data.audioUrl },
            { shouldPlay: true }
          );
          setSound(newSound);
        } else {
          Alert.alert('Error', data.message || 'Failed to get audio from the server.');
        }
      } catch (error) {
        console.error('TTS API call failed:', error);
        Alert.alert('Error', 'Could not connect to the TTS service.');
      } finally {
        setIsLoading(false);
      }
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

      <TouchableOpacity 
        style={styles.readButton} 
        onPress={readTextAloud} 
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>{isLoading ? 'Loading...' : 'කියවන්න'}</Text>
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