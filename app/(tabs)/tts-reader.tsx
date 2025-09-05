import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const BACKEND_URL = 'http://192.168.43.114:3000';
const USER_ID = 1;

interface Note {
    id: number;
    content: string;
    filePath: string;
    createdAt: string;
}

export default function TTSReaderScreen() {
    const [text, setText] = useState('');
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [savedNotes, setSavedNotes] = useState<Note[]>([]);
    const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

    useEffect(() => {
        fetchNotes();
        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [sound]);

    const fetchNotes = async () => {
        try {
         
            const response = await fetch(`${BACKEND_URL}/notes/${USER_ID}`);
            if (response.ok) {
                const data = await response.json();
                setSavedNotes(data.notes.filter((note: { type: string; }) => note.type === 'text_to_speech'));
            } else {
                const errorText = await response.text();
                console.error('Failed to fetch notes:', errorText);
            }

        } catch (error) {
            console.error('Network error fetching notes:', error);
            Alert.alert('දෝෂය', 'සටහන් පූරණය කිරීම අසාර්ථකයි. සර්වර් එක ක්‍රියාත්මක දැයි පරීක්ෂා කරන්න.');
        }
    };

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
                    Alert.alert('දෝෂය', data.message || 'සර්වර් එකෙන් ශ්‍රව්‍ය ගොනුව ලබා ගැනීම අසාර්ථකයි.');
                }
            } catch (error) {
                console.error('TTS API call failed:', error);
                Alert.alert('දෝෂය', 'TTS සේවාවට සම්බන්ධ විය නොහැක.');
            } finally {
                setIsLoading(false);
            }
        } else {
            Alert.alert('අවවාදයයි', 'කථනය සඳහා යමක් ඇතුළත් කරන්න!');
        }
    };

    const saveNote = async () => {
        if (text.trim()) {
            try {
                const response = await fetch(`${BACKEND_URL}/saveNote`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: USER_ID, note: text, type: 'text_to_speech' }),
                });
                const data = await response.json();
                if (data.status === 'success') {
                    Alert.alert('සාර්ථකයි', 'සටහන සුරැකිණි!');
                    setText('');
                    fetchNotes();
                } else {
                    Alert.alert('දෝෂය', data.message || 'සටහන සුරැකීම අසාර්ථකයි.');
                }
            } catch (error) {
                console.error('Network error while saving note:', error);
                Alert.alert('දෝෂය', 'සර්වර් එකට සම්බන්ධ වීමට නොහැක.');
            }
        } else {
            Alert.alert('අවවාදයයි', 'සුරැකීමට පෙර යමක් ඇතුළත් කරන්න!');
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

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.readButton} onPress={readTextAloud} disabled={isLoading}>
                    {isLoading ? (
                        <Text style={styles.buttonText}>Loading...</Text>
                    ) : (
                        <Text style={styles.buttonText}>🔊  කියවන්න</Text>
                    )}
                </TouchableOpacity>
               
            </View>


            <View>
               <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
                    <Text style={styles.buttonText}>සටහන සුරකින්න</Text>
                </TouchableOpacity>
            </View>

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
                        >
                            <Ionicons name="document-text" size={24} color="#4e73df" style={styles.noteIcon} />
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
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
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
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 10, // Added gap for spacing
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
        textAlign: 'center',
        marginTop: 10,
    },
});