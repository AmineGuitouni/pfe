import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import './markdown.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const components: Components = {
    // Code blocks with syntax highlighting
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const isInline = !props.node || props.node.position?.start.line === props.node.position?.end.line;
      
      return !isInline && language ? (
        <SyntaxHighlighter
          style={oneDark as any}
          language={language}
          PreTag="div"
          className="rounded-md !my-2 !text-sm"
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code 
          className="bg-gray-800 text-yellow-300 px-1.5 py-0.5 rounded text-sm font-mono" 
          {...props}
        >
          {children}
        </code>
      );
    },
    
    // Headers
    h1: ({ children }) => (
      <h1 className="text-xl font-bold text-white mb-3 mt-4 first:mt-0 border-b border-gray-600 pb-2">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-lg font-semibold text-white mb-2 mt-3 first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-base font-medium text-white mb-2 mt-3 first:mt-0">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-sm font-medium text-gray-200 mb-1 mt-2 first:mt-0">
        {children}
      </h4>
    ),
    
    // Paragraphs
    p: ({ children }) => (
      <p className="text-sm text-gray-100 mb-2 last:mb-0 leading-relaxed">
        {children}
      </p>
    ),
    
    // Lists
    ul: ({ children }) => (
      <ul className="list-disc list-inside text-sm text-gray-100 mb-2 space-y-1 ml-2">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside text-sm text-gray-100 mb-2 space-y-1 ml-2">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="leading-relaxed">{children}</li>
    ),
    
    // Links
    a: ({ href, children }) => (
      <a 
        href={href} 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-light_blue-400 hover:text-light_blue-300 underline transition-colors"
      >
        {children}
      </a>
    ),
    
    // Emphasis
    strong: ({ children }) => (
      <strong className="font-semibold text-white">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-200">{children}</em>
    ),
    
    // Blockquotes
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-light_blue-500 pl-4 py-2 my-2 bg-gray-800/50 rounded-r-md">
        <div className="text-gray-200 text-sm">{children}</div>
      </blockquote>
    ),
    
    // Tables
    table: ({ children }) => (
      <div className="overflow-x-auto my-3">
        <table className="min-w-full border border-gray-600 rounded-lg overflow-hidden">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-gray-700">{children}</thead>
    ),
    tbody: ({ children }) => (
      <tbody className="bg-gray-800">{children}</tbody>
    ),
    tr: ({ children }) => (
      <tr className="border-b border-gray-600 last:border-b-0">{children}</tr>
    ),
    th: ({ children }) => (
      <th className="px-3 py-2 text-left text-sm font-medium text-white border-r border-gray-600 last:border-r-0">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="px-3 py-2 text-sm text-gray-200 border-r border-gray-600 last:border-r-0">
        {children}
      </td>
    ),
    
    // Horizontal rule
    hr: () => (
      <hr className="border-gray-600 my-4" />
    ),
    
    // Task lists (GitHub Flavored Markdown)
    input: ({ checked, type, ...props }) => {
      if (type === 'checkbox') {
        return (
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mr-2 accent-light_blue-500"
            {...props}
          />
        );
      }
      return <input type={type} {...props} />;
    }
  };

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;