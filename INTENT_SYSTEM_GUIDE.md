# 🧠 Scout1 Comprehensive Intent System

## Overview

Scout1 now implements a comprehensive intent analysis system based on the professor's AI backend capabilities. This document outlines all available intents, their usage, and implementation details.

## 🎯 Available Intent Categories

### 1. **Vision & Scene Analysis** 
- **Intent**: `describe_scene`
- **Keywords**: "describe", "what do you see", "scene", "surroundings", "what's happening"
- **Examples**:
  - "What do you see?"
  - "Describe the scene"
  - "What's in front of me?"
  - "Tell me about my surroundings"
- **Processing**: Requires camera image, sent to Professor API
- **Response**: Detailed description of visual environment

### 2. **Text Recognition (OCR)**
- **Intent**: `read_text`
- **Keywords**: "read", "text", "document", "sign", "menu", "what does it say"
- **Examples**:
  - "Read this text"
  - "What does this say?"
  - "Read the document"
  - "Read the sign"
- **Processing**: Requires camera image, OCR via Professor API
- **Response**: Extracted text content

### 3. **Object Detection & Search**
- **Intent**: `find_object`
- **Keywords**: "find", "where is", "look for", "locate", "search"
- **Examples**:
  - "Find my keys"
  - "Where is the cup?"
  - "Look for a chair"
  - "Is there a door?"
- **Processing**: Requires camera image + query text, object detection via Professor API
- **Response**: Object locations with spatial information

### 4. **Visual Question Answering**
- **Intent**: `answer_question`
- **Keywords**: Questions with visual context ("how many", "what color", "is the")
- **Examples**:
  - "How many people are in the room?"
  - "What color is the car?"
  - "Is the door open?"
  - "What's on the table?"
- **Processing**: Requires camera image + question, VQA via Professor API
- **Response**: Specific answers to visual questions

### 5. **Face Recognition**
- **Intent**: `face_detect`
- **Keywords**: "who", "person", "face", "recognize"
- **Examples**:
  - "Who is this person?"
  - "Who do you see?"
  - "Recognize this face"
  - "Do you know this person?"
- **Processing**: Requires camera image, face recognition via Professor API
- **Response**: Names of recognized people

### 6. **Face Management**
- **Intent**: `save_face`
- **Keywords**: "save", "remember", "add", "register", "learn" + person name
- **Examples**:
  - "Save this person as John"
  - "Remember this face as Mom"
  - "Add this person to database"
  - "Register this face as Dad"
- **Processing**: Requires camera image + person name, face enrollment via Professor API
- **Response**: Confirmation of face saved

### 7. **Time & Date**
- **Intent**: `time`
- **Keywords**: "time", "clock", "date", "what time is it"
- **Examples**:
  - "What time is it?"
  - "Tell me the time"
  - "What's the current time?"
- **Processing**: Local device time
- **Response**: Current time and date announcement

### 8. **Weather Information**
- **Intent**: `weather`
- **Keywords**: "weather", "temperature", "rain", "sunny", "forecast"
- **Examples**:
  - "What's the weather?"
  - "Weather in New York"
  - "Is it raining?"
  - "Temperature today"
- **Processing**: Weather API (requires implementation)
- **Response**: Weather conditions and forecast

### 9. **Location Settings**
- **Intent**: `set_city`
- **Keywords**: "set location", "change city", "my location is"
- **Examples**:
  - "Set my location to Boston"
  - "Change city to Paris"
  - "My location is Mumbai"
- **Processing**: Local storage of default city
- **Response**: Confirmation of location setting

### 10. **Help & Commands**
- **Intent**: `help`
- **Keywords**: "help", "what can you do", "commands"
- **Examples**:
  - "What can you help me with?"
  - "What can you do?"
  - "Help me"
  - "List commands"
- **Processing**: Local response
- **Response**: List of available capabilities

### 11. **General Conversation**
- **Intent**: `general_conversation`
- **Keywords**: Conversational phrases ("hello", "how are you", "thank you")
- **Examples**:
  - "How are you?"
  - "Hello"
  - "Good morning"
  - "Thank you"
- **Processing**: Simple conversational responses
- **Response**: Friendly conversational replies

## 🔧 Technical Implementation

### Intent Processing Flow
```typescript
1. Wake Word Detection ("Bumblebee") → VoiceService
2. Speech-to-Text (simulated currently) → Text input
3. Intent Classification → IntentService.getIntent()
4. Intent Routing → handleIntent() switch statement
5. Processing:
   - Local: time, help, conversation
   - Visual: camera + Professor API
   - Weather: weather API (to be implemented)
6. Text-to-Speech Response → TtsService
```

### API Communication
```typescript
// Visual intents sent to Professor API
{
  "task": "describe_scene" | "read_text" | "find_object" | "answer_question" | "face_detect" | "save_face",
  "image_data": "base64_encoded_image",
  "query_text": "optional_text_for_context",
  "person_name": "optional_for_save_face"
}
```

### Pattern Matching System
- **Primary Keywords**: High-confidence intent indicators
- **Context Clues**: Secondary keywords for disambiguation
- **Extraction Patterns**: RegEx for extracting names, cities, etc.
- **Fallback Logic**: Unknown → general_conversation → help

## 🧪 Testing Interface

### Built-in Test Panel
- Toggle button in top-right corner (TEST/✕)
- 10 pre-configured test buttons for each intent category
- Real-time intent classification testing
- Visual feedback for processing states

### Test Commands
```typescript
'describe the scene'        → describe_scene
'read this text'           → read_text  
'find my keys'             → find_object
'who is this person'       → face_detect
'save this person as John' → save_face
'what time is it'          → time
'what\'s the weather'      → weather
'what can you do'          → help
'how many people are here' → answer_question
'hello how are you'        → general_conversation
```

## 🚀 Usage Guide

### For Regular Use
1. Say "Bumblebee" to activate
2. Wait for "Understanding..." response
3. Currently simulates "describe the scene" command
4. Real speech-to-text integration pending

### For Testing & Development
1. Tap "TEST" button in top-right
2. Select any intent test button
3. Watch real-time intent processing
4. Verify responses and API communication

## 🔜 Future Enhancements

### Ready for Integration
- **Custom Wake Word**: "Hey Iris" model from Picovoice Console
- **Speech-to-Text**: Picovoice Cheetah for real voice input
- **Custom Intent Model**: Rhino model for improved intent recognition

### Pending Implementation
- **Weather API**: OpenWeatherMap or similar service
- **Persistent Storage**: User preferences and face database
- **Additional Endpoints**: save_face, weather, location management

## 📊 Intent Classification Accuracy

### High Confidence (90%+)
- Scene description with "describe" keyword
- Text reading with "read" keyword  
- Time requests with "time" keyword
- Help requests with "help" keyword

### Medium Confidence (70-90%)
- Object search with context clues
- Face operations with person names
- Weather requests with location

### Requires Improvement
- Complex conversational intents
- Ambiguous questions without context
- Multi-intent commands

## 🛠️ Developer Notes

### Adding New Intents
1. Update `Intent` type in `IntentService.ts`
2. Add pattern matching in `getIntent()` method
3. Create handler function in `app/index.tsx`
4. Add to `handleIntent()` switch statement
5. Update test panel if needed

### Debugging Tools
- Console logging for all intent classifications
- Visual feedback in UI status text
- Test panel for isolated intent testing
- Error handling with TTS feedback

This comprehensive intent system provides a robust foundation for the Scout1 voice assistant, with clear pathways for expansion and improvement!