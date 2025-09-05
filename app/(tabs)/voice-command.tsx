import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BACKEND_URL = 'http://192.168.43.114:3000';
const USER_ID = 1;

interface Note {
    id: number;
    content: string;
    filePath: string;
    createdAt: string;
}

export default function VoiceCommandScreen() {
    const [isListening, setIsListening] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [transcribedText, setTranscribedText] = useState('');
    const [savedNotes, setSavedNotes] = useState<Note[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

    useEffect(() => {
        fetchNotes();
        return () => {
            if (recording) {
                recording.stopAndUnloadAsync();
            }
        };
    }, [recording]);

    const fetchNotes = async () => {
        try {
             const response = await fetch(`${BACKEND_URL}/notes/${USER_ID}`);
            if (response.ok) {
                const data = await response.json();
                setSavedNotes(data.notes.filter((note: { type: string; }) => note.type === 'speech_to_text'));
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch notes:', errorText);
            }
        } catch (error) {
            console.error('Network error fetching notes:', error);
            Alert.alert('දෝෂය', 'සටහන් පූරණය කිරීම අසාර්ථකයි. සර්වර් එක ක්‍රියාත්මක දැයි පරීක්ෂා කරන්න.');
        }
    };

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
        } catch (err) {
            console.error('Failed to start recording', err);
            Alert.alert('දෝෂය', 'හඬ පටිගත කිරීම ආරම්භ කිරීමට නොහැක.');
        }
    };

    const stopRecording = async () => {
        setIsListening(false);
        setIsLoading(true);
        if (recording) {
            try {
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                setRecording(null);
                if (uri) {
                    await transcribeAudio(uri);
                } else {
                    console.error('Recording URI is null.');
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('Failed to stop recording', err);
                setIsLoading(false);
                Alert.alert('දෝෂය', 'පටිගත කිරීම නැවැත්වීම අසාර්ථකයි.');
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

            const response = await fetch(`${BACKEND_URL}/transcribe`, {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server returned status ${response.status}: ${errorText}`);
            }
            const data = await response.json();
            if (data.status === 'success' && data.text) {
                setTranscribedText(data.text);
                Alert.alert('සාර්ථකයි', 'කථනය පෙළ බවට පරිවර්තනය කෙරිණි.');
            } else {
                Alert.alert('දෝෂය', data.message || 'පරිවර්තනය අසාර්ථකයි.');
            }
        } catch (error: any) {
            console.error('Network or transcription error:', error);
            Alert.alert('දෝෂය', `පරිවර්තන සේවාවට සම්බන්ධ වීමට නොහැක. (${error.message})`);
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
                const response = await fetch(`${BACKEND_URL}/saveNote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: USER_ID, note: transcribedText, type: 'speech_to_text' }),
                });
                const data = await response.json();
                if (data.status === 'success') {
                    Alert.alert('සාර්ථකයි', 'සටහන සුරැකිණි!');
                    setTranscribedText('');
                    fetchNotes();
                } else {
                    Alert.alert('දෝෂය', data.message || 'සටහන සුරැකීම අසාර්ථකයි.');
                }
            } catch (error) {
                console.error('Network error while saving note:', error);
                Alert.alert('දෝෂය', 'සර්වර් එකට සම්බන්ධ වීමට නොහැක.');
            }
        } else {
            Alert.alert('අවවාදයයි', 'සුරැකීමට පෙර යමක් කතා කරන්න!');
        }
    };

    const deleteNote = async () => {
        if (selectedNoteId === null) {
            Alert.alert('අවවාදයයි', 'මකා දැමීමට සටහනක් තෝරන්න.');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/notes/${selectedNoteId}`, {
                method: 'DELETE',
            });
            const data = await response.json();
            if (data.status === 'success') {
                Alert.alert('සාර්ථකයි', 'සටහන සාර්ථකව මකා දැමිණි.');
                setSelectedNoteId(null);
                fetchNotes();
            } else {
                Alert.alert('දෝෂය', data.message || 'සටහන මකා දැමීම අසාර්ථකයි.');
            }
        } catch (error) {
            console.error('Network error while deleting note:', error);
            Alert.alert('දෝෂය', 'සර්වර් එකට සම්බන්ධ වීමට නොහැක.');
        }
    };

    const handleNotePress = (noteId: number) => {
        setSelectedNoteId(noteId === selectedNoteId ? null : noteId);
    };

    const openNoteFile = async (filePath: string) => {
        const url = `${BACKEND_URL}/${filePath}`;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert('දෝෂය', 'මෙම ගොනුව විවෘත කිරීමට නොහැක.');
            }
        } catch (error) {
            console.error('Failed to open file:', error);
            Alert.alert('දෝෂය', 'ගොනුව විවෘත කිරීමේදී දෝෂයක් සිදුවිය.');
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>🎤 හඬ විධාන</Text>
            <Text style={styles.instructions}>කතා කරන්න. එය පෙළ බවට පරිවර්තනය කරනු ඇත.</Text>
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
            {isLoading && <Text style={styles.loadingText}>පරිවර්තනය වෙමින් පවතී...</Text>}
            <TextInput
                style={styles.notepad}
                multiline
                value={transcribedText}
                placeholder="ඔබේ සටහන මෙහි දිස්වනු ඇත..."
                onChangeText={setTranscribedText}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                <Text style={styles.buttonText}>සටහන සුරකින්න</Text>
            </TouchableOpacity>

            <View style={styles.savedNotesContainer}>
                <View style={styles.savedNotesHeader}>
                    <Text style={styles.savedNotesTitle}>සුරැකි සටහන්:</Text>
                    {selectedNoteId !== null && (
                        <TouchableOpacity onPress={deleteNote}>
                            <Ionicons name="trash" size={24} color="red" />
                        </TouchableOpacity>
                    )}
                </View>
                {savedNotes.length > 0 ? (
                    savedNotes.map((note) => (
                        <TouchableOpacity
                            key={note.id}
                            style={[styles.savedNoteItem, selectedNoteId === note.id && styles.selectedNote]}
                            onPress={() => handleNotePress(note.id)}
                            onLongPress={() => openNoteFile(note.filePath)}
                        >
                            <Ionicons name="document-text" size={24} color="#4e73df" style={styles.noteIcon} />
                            {/* FIX: Moved the content text inside a Text component */}
                            <Text style={styles.savedNoteText}>{note.content.substring(0, 40)}...</Text>
                            {selectedNoteId === note.id && (
                                <View style={styles.noteActions}>
                                    <Ionicons name="checkmark-circle" size={24} color="green" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))
                ) : (
                    <Text style={styles.noSavedNotes}>තාම සටහන් සුරැකිලා නැහැ.</Text>
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
    savedNotesHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    savedNotesTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#444',
    },
    savedNoteItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        marginVertical: 5,
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
        position: 'relative',
    },
    selectedNote: {
        borderColor: '#4e73df',
        borderWidth: 2,
    },
    noteIcon: {
        marginRight: 10,
    },
    savedNoteText: {
        flex: 1,
        fontSize: 16,
        color: '#666',
    },
    noteActions: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
        right: 10,
    },
    noSavedNotes: {
        fontSize: 16,
        color: '#999',
    },
});