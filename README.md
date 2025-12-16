# Jyotisha

A Flask-based AI chat system that allows you to connect to your local LLM (Large Language Model) server.

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
- 🐍 **Flask Backend** - Python-based backend with API proxy support

## Getting Started

### Prerequisites

- Python 3.8+
- A local LLM server running. Popular options include:
  - [Ollama](https://ollama.ai/) - Easy to use, runs models like Llama 2, Mistral, etc.
  - [LM Studio](https://lmstudio.ai/) - GUI for running local LLMs
  - Any OpenAI-compatible API server

### Installation

1. Clone this repository:
```bash
git clone https://github.com/Suuwam/apbla.git
cd apbla
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Run the Flask application:
```bash
python app.py
```

4. Open http://localhost:5000 in your browser

### Environment Variables

- `PORT` - Server port (default: 5000)
- `FLASK_DEBUG` - Enable debug mode (default: false)
- `SECRET_KEY` - Flask secret key (set in production)

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

## API Endpoints

The Flask backend provides the following API endpoints:

- `GET /` - Render the main chat interface
- `POST /api/chat` - Send messages and get responses from LLM
- `POST /api/test-connection` - Test connection to LLM server
- `POST /api/stream` - Stream responses from LLM (Server-Sent Events)

## Screenshots

### Main Interface
![Main Interface](https://github.com/user-attachments/assets/b06d4328-65ad-41b8-9610-8f05e6b16ac5)

### Settings Panel
![Settings](https://github.com/user-attachments/assets/59a3c6c8-cb26-4417-ab24-c34cd4cfa5c9)

### Mobile View
![Mobile](https://github.com/user-attachments/assets/9da3f8b8-1b12-4078-a081-9723b8f8bb58)

## File Structure

```
├── app.py                  # Flask application
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Main HTML template
├── static/
│   ├── css/
│   │   └── styles.css      # Styling with dark theme
│   ├── js/
│   │   └── app.js          # JavaScript application logic
│   └── images/
│       └── logo.png        # Application logo
├── logo.png                # Application logo (root)
└── README.md               # This file
```

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

MIT License