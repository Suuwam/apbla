"""
Jyotisha - AI Chat System
Flask Backend Application
"""

from flask import Flask, render_template, request, jsonify, Response
import requests
import json
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'jyotisha-secret-key-change-in-production')

# Default LLM settings
DEFAULT_SETTINGS = {
    'api_endpoint': 'http://localhost:11434/api/generate',
    'model_name': 'llama2',
    'api_format': 'ollama',
    'temperature': 0.7,
    'max_tokens': 2048,
    'system_prompt': ''
}


@app.route('/')
def index():
    """Render the main chat interface."""
    return render_template('index.html')


@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages and proxy to LLM API."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        messages = data.get('messages', [])
        settings = data.get('settings', DEFAULT_SETTINGS)
        
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
        
        # Build the prompt
        prompt = build_prompt(messages, settings.get('system_prompt', ''))
        
        # Get LLM response
        response = get_llm_response(prompt, settings)
        
        return jsonify({'response': response})
    
    except requests.exceptions.ConnectionError:
        return jsonify({'error': 'Could not connect to LLM server. Is it running?'}), 503
    except requests.exceptions.Timeout:
        return jsonify({'error': 'LLM server request timed out'}), 504
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/test-connection', methods=['POST'])
def test_connection():
    """Test connection to the LLM API."""
    try:
        data = request.get_json()
        settings = data.get('settings', DEFAULT_SETTINGS)
        
        # Try a simple request to test connection
        response = get_llm_response('Hello', settings, timeout=10)
        
        return jsonify({'success': True, 'message': 'Connection successful!'})
    
    except requests.exceptions.ConnectionError:
        return jsonify({'success': False, 'message': 'Could not connect to LLM server'}), 503
    except requests.exceptions.Timeout:
        return jsonify({'success': False, 'message': 'Connection timed out'}), 504
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


@app.route('/api/stream', methods=['POST'])
def stream_chat():
    """Stream chat responses from LLM."""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        messages = data.get('messages', [])
        settings = data.get('settings', DEFAULT_SETTINGS)
        
        if not messages:
            return jsonify({'error': 'No messages provided'}), 400
        
        prompt = build_prompt(messages, settings.get('system_prompt', ''))
        
        def generate():
            for chunk in stream_llm_response(prompt, settings):
                yield f"data: {json.dumps({'content': chunk})}\n\n"
            yield "data: [DONE]\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


def build_prompt(messages, system_prompt=''):
    """Build a prompt string from messages."""
    prompt = ''
    
    if system_prompt:
        prompt += f"System: {system_prompt}\n\n"
    
    for msg in messages:
        role = 'User' if msg.get('role') == 'user' else 'Assistant'
        prompt += f"{role}: {msg.get('content', '')}\n\n"
    
    prompt += 'Assistant: '
    return prompt


def get_llm_response(prompt, settings, timeout=60):
    """Get a response from the LLM API."""
    api_endpoint = settings.get('api_endpoint', DEFAULT_SETTINGS['api_endpoint'])
    model_name = settings.get('model_name', DEFAULT_SETTINGS['model_name'])
    api_format = settings.get('api_format', DEFAULT_SETTINGS['api_format'])
    temperature = settings.get('temperature', DEFAULT_SETTINGS['temperature'])
    max_tokens = settings.get('max_tokens', DEFAULT_SETTINGS['max_tokens'])
    api_key = settings.get('api_key', '')
    
    headers = {'Content-Type': 'application/json'}
    
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    
    # Build request body based on API format
    if api_format == 'ollama':
        body = {
            'model': model_name,
            'prompt': prompt,
            'stream': False,
            'options': {
                'temperature': temperature,
                'num_predict': max_tokens
            }
        }
    elif api_format == 'openai':
        body = {
            'model': model_name,
            'messages': [{'role': 'user', 'content': prompt}],
            'temperature': temperature,
            'max_tokens': max_tokens
        }
    else:
        body = {
            'model': model_name,
            'prompt': prompt
        }
    
    response = requests.post(
        api_endpoint,
        headers=headers,
        json=body,
        timeout=timeout
    )
    response.raise_for_status()
    
    data = response.json()
    
    # Extract response based on API format
    if api_format == 'ollama':
        return data.get('response', '')
    elif api_format == 'openai':
        choices = data.get('choices', [])
        if choices:
            return choices[0].get('message', {}).get('content', '') or choices[0].get('text', '')
    
    # Try common response fields
    return (data.get('response') or data.get('content') or 
            data.get('text') or data.get('output') or str(data))


def stream_llm_response(prompt, settings):
    """Stream response from LLM API."""
    api_endpoint = settings.get('api_endpoint', DEFAULT_SETTINGS['api_endpoint'])
    model_name = settings.get('model_name', DEFAULT_SETTINGS['model_name'])
    temperature = settings.get('temperature', DEFAULT_SETTINGS['temperature'])
    max_tokens = settings.get('max_tokens', DEFAULT_SETTINGS['max_tokens'])
    api_key = settings.get('api_key', '')
    
    headers = {'Content-Type': 'application/json'}
    
    if api_key:
        headers['Authorization'] = f'Bearer {api_key}'
    
    body = {
        'model': model_name,
        'prompt': prompt,
        'stream': True,
        'options': {
            'temperature': temperature,
            'num_predict': max_tokens
        }
    }
    
    with requests.post(api_endpoint, headers=headers, json=body, stream=True, timeout=120) as response:
        response.raise_for_status()
        for line in response.iter_lines():
            if line:
                try:
                    data = json.loads(line)
                    if data.get('response'):
                        yield data['response']
                    if data.get('done'):
                        break
                except json.JSONDecodeError:
                    continue


if __name__ == '__main__':
    # Run the Flask development server
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
