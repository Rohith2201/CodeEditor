import { useState } from 'react';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-java';
import 'ace-builds/src-noconflict/mode-c_cpp';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-sql';
import 'ace-builds/src-noconflict/theme-monokai';

const languageModes = {
  python: 'python',
  java: 'java',
  c: 'c_cpp',
  cpp: 'c_cpp',
  javascript: 'javascript',
  sql: 'sql',
};

interface CodeEditorProps {
  language: string;
  onSubmit: (code: string) => void;
}

export default function CodeEditor({ language, onSubmit }: CodeEditorProps) {
  const [code, setCode] = useState('');

  const handleSubmit = () => {
    onSubmit(code);
  };

  return (
    <div className="space-y-4">
      <AceEditor
        mode={languageModes[language] || 'text'}
        theme="monokai"
        onChange={setCode}value={code}
        name="code-editor"
        editorProps={{ $blockScrolling: true }}
        setOptions={{
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
          showLineNumbers: true,
          tabSize: 2,
        }}
        style={{ width: '100%', height: '400px' }}
      />
      <button
        onClick={handleSubmit}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-200"
      >
        Submit
      </button>
    </div>
  );
}

