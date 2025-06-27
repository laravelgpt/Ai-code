'use client';

import React from 'react';
import Editor, { OnChange, OnMount } from '@monaco-editor/react';
import { LoaderCircle } from 'lucide-react';

interface CodeEditorProps {
  language: string;
  value: string;
  theme: string;
  onChange: OnChange;
  onMount: OnMount;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  language,
  value,
  theme,
  onChange,
  onMount,
}) => {
  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      theme={theme}
      onChange={onChange}
      onMount={onMount}
      loading={<div className="flex items-center justify-center h-full"><LoaderCircle className="animate-spin h-8 w-8 text-primary" /></div>}
      options={{
        minimap: {
          enabled: true,
        },
        fontSize: 14,
        wordWrap: 'on',
        scrollBeyondLastLine: false,
        automaticLayout: true,
      }}
    />
  );
};

export default CodeEditor;
