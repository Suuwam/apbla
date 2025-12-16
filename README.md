# Jyotisha

A complete chat system frontend that allows you to connect to your local LLM (Large Language Model) server.

![Jyotisha Screenshot](https://github.com/user-attachments/assets/b06d4328-65ad-41b8-9610-8f05e6b16ac5)

## Features

- 🎨 **Dark Theme** - Modern dark interface with orange and gray accent colors
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 💬 **Chat Interface** - Clean message bubbles with user and AI avatars
- 💾 **Chat History** - Saves conversations locally in your browser
- ⚙️ **Configurable LLM** - Connect to any local LLM server (Ollama, LM Studio, etc.)
- 🔧 **Multiple API Formats** - Support for Ollama, OpenAI-compatible, and custom APIs
- 🎛️ **Generation Parameters** - Adjust temperature, max tokens, and system prompts
- ⚡ **Quick Actions** - Pre-defined prompts for quick interactions

## Getting Started

### Prerequisites

You need a local LLM server running. Popular options include:

- [Ollama](https://ollama.ai/) - Easy to use, runs models like Llama 2, Mistral, etc.
- [LM Studio](https://lmstudio.ai/) - GUI for running local LLMs
- Any OpenAI-compatible API server

### Running the Chat Interface

1. Clone this repository
2. Open `index.html` in your browser, or serve it with a local server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve
```

3. Open http://localhost:8080 in your browser

### Configuration

1. Click the **Settings** button in the sidebar
2. Configure your LLM endpoint:
   - **API Endpoint**: Your LLM server URL (default: `http://localhost:11434/api/generate` for Ollama)
   - **Model Name**: The model to use (e.g., `llama2`, `mistral`, `codellama`)
   - **API Format**: Choose between Ollama, OpenAI Compatible, or Custom
3. Optionally configure:
   - **API Key**: If your server requires authentication
   - **Temperature**: Controls randomness (0 = deterministic, 2 = very random)
   - **Max Tokens**: Maximum response length
   - **System Prompt**: Set the AI's behavior
4. Click **Test Connection** to verify your setup
5. Click **Save Settings**

## Usage

1. Click **New Chat** to start a conversation
2. Type your message in the input box
3. Press Enter to send (Shift+Enter for new line)
4. Use the quick action buttons for common prompts

## Screenshots

### Main Interface
![Main Interface](https://github.com/user-attachments/assets/b06d4328-65ad-41b8-9610-8f05e6b16ac5)

### Settings Panel
![Settings](https://github.com/user-attachments/assets/59a3c6c8-cb26-4417-ab24-c34cd4cfa5c9)

### Mobile View
![Mobile](https://github.com/user-attachments/assets/9da3f8b8-1b12-4078-a081-9723b8f8bb58)

## File Structure

```
├── index.html      # Main HTML structure
├── styles.css      # Styling with dark theme
├── app.js          # JavaScript application logic
├── logo.png        # Application logo
└── README.md       # This file
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License