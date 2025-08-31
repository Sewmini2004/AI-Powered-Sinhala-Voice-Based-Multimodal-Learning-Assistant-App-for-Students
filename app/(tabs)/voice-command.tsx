import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// NOTE: This file assumes you have all necessary packages installed.
// Required packages: expo-av, @expo/vector-icons, expo-file-system

const BACKEND_URL = 'http://192.168.181.183:3000';

export default function VoiceCommandScreen() {
    const [isListening, setIsListening] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [transcribedText, setTranscribedText] = useState('');
    const [savedNotes, setSavedNotes] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Clean up audio recording on component unmount
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, [recording]);

    const startRecording = async () => {
        try {
            await Audio.requestPermissionsAsync();
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const newRecording = new Audio.Recording();
            await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
            await newRecording.startAsync();
            setRecording(newRecording);
            setIsListening(true);
            console.log('LOG Recording started...');
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        setIsListening(false);
        setIsLoading(true);
        if (recording) {
            try {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                console.log('LOG Recording stopped. URI:', uri);
                setRecording(null);

                if (uri) {
                    await transcribeAudio(uri);
                } else {
                    console.error('Recording URI is null.');
                }
            } catch (err) {
                console.error('Failed to stop recording', err);
                setIsLoading(false);
            }
        }
    };

const transcribeAudio = async (audioUri: string) => {
    try {
        const formData = new FormData();
      
        formData.append('audioFile', {
            uri: audioUri,
            name: 'recording.m4a',
            type: 'audio/m4a'
        } as any);

        console.log('LOG Sending audio to backend for transcription...');
        const response = await fetch(`${BACKEND_URL}/transcribe`, {
            method: 'POST',
           
            body: formData,
        });
        const responseText = await response.text();
        console.log('Received response text:', responseText);

        const data = JSON.parse(responseText);

        if (data.status === 'success' && data.text) {
            setTranscribedText(data.text);
            console.log('LOG Transcription successful:', data.text);
        } else {
            console.error('Transcription failed:', data.message || 'Unknown error');
        }
    } catch (error) {
        console.error('ERROR Network or transcription error:', error);
        setTranscribedText('Error: Transcription failed. ' + (error|| ''));
    } finally {
        setIsLoading(false);
        if (audioUri) {
            await FileSystem.deleteAsync(audioUri, { idempotent: true });
        }
    }
};

    const saveNote = async () => {
        if (transcribedText.trim()) {
            try {
                const userId = 1;

                const response = await fetch(`${BACKEND_URL}/saveNote`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId,
                        note: transcribedText,
                    }),
                });

                const data = await response.json();
                if (data.status === 'success') {
                    console.log('Note saved successfully!');
                    setTranscribedText('');
                    setSavedNotes((prevNotes) => [...prevNotes, transcribedText]);
                } else {
                    console.error('Failed to save note:', data.message);
                }
            } catch (error) {
                console.error('Network error while saving note:', error);
            }
        } else {
            console.log('Please speak something before saving!');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>🎤 Voice Command</Text>
            <Text style={styles.instructions}>Speak to the app and it will type the words.</Text>
            <View style={styles.buttonContainer}>
                {isListening ? (
                    <TouchableOpacity style={styles.micButton} onPress={stopRecording}>
                        <Ionicons name="stop-circle" size={50} color="red" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.micButton} onPress={startRecording}>
                        <Ionicons name="mic" size={50} color="#4e73df" />
                    </TouchableOpacity>
                )}
            </View>
            {isLoading && <Text style={styles.loadingText}>Transcribing...</Text>}
            <TextInput
                style={styles.notepad}
                multiline
                value={transcribedText}
                placeholder="Your note will appear here..."
                onChangeText={setTranscribedText}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                <Text style={styles.buttonText}>Save Note</Text>
            </TouchableOpacity>
            <View style={styles.savedNotesContainer}>
                <Text style={styles.savedNotesTitle}>Saved Notes:</Text>
                {savedNotes.length > 0 ? (
                    savedNotes.map((note, index) => (
                        <Text key={index} style={styles.savedNote}>
                            {index + 1}. {note}
                        </Text>
                    ))
                ) : (
                    <Text style={styles.noSavedNotes}>No notes saved yet.</Text>
                )}
            </View>
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
    loadingText: {
        fontSize: 18,
        color: '#4e73df',
        marginBottom: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 30,
    },
    micButton: {
        backgroundColor: '#fff',
        padding: 25,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#4e73df',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 8,
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
    saveButton: {
        backgroundColor: '#28a745',
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
    savedNotesContainer: {
        width: '100%',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#ddd',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    savedNotesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#444',
    },
    savedNote: {
        fontSize: 16,
        marginBottom: 5,
        color: '#666',
    },
    noSavedNotes: {
        fontSize: 16,
        color: '#999',
    },
});