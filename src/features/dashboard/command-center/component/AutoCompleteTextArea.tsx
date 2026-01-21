// src/components/AutoCompleteTextArea.tsx
"use client";

import React, { useState, useRef, useEffect, useCallback, ChangeEvent, KeyboardEvent } from 'react';

interface CommandParameter {
  name: string; // e.g., "--param1", "--user"
  description: string;
  placeholder?: string; // e.g., "value", "user_id"
  isRequired?: boolean;
}

export interface Command {
  name: string; // e.g., "deploy", "fetch_users"
  description: string;
  parameters?: CommandParameter[];
}

interface AutoCompleteTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  enableAutocomplete: boolean;
  commands: Command[];
  value: string;
  onValueChange: (value: string) => void;
  onSubmit?: () => void;
  submitDisabled?: boolean;
}

const AutoCompleteTextArea: React.FC<AutoCompleteTextAreaProps> = ({
  enableAutocomplete,
  commands,
  value,
  onValueChange,
  onSubmit,
  submitDisabled = false,
  ...textareaProps
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [currentContext, setCurrentContext] = useState<'command' | 'parameter' | null>(null);
  const [activeCommand, setActiveCommand] = useState<Command | null>(null);
  const [suggestionPosition, setSuggestionPosition] = useState<{ top: number; left: number } | null>(null);
  const [commandValidation, setCommandValidation] = useState<{
    isValid: boolean;
    missingRequiredParams: string[];
    hasActiveCommand: boolean;
  }>({ isValid: false, missingRequiredParams: [], hasActiveCommand: false });
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLUListElement>(null);
  const hiddenMirrorRef = useRef<HTMLDivElement | null>(null);

  // Effect to create and manage the hidden mirror div for position calculation
  useEffect(() => {
    const mirror = document.createElement('div');
    document.body.appendChild(mirror);
    hiddenMirrorRef.current = mirror;

    return () => {
      if (hiddenMirrorRef.current && hiddenMirrorRef.current.parentNode === document.body) {
        document.body.removeChild(hiddenMirrorRef.current);
      }
      hiddenMirrorRef.current = null;
    };
  }, []);

  const getCursorInfo = useCallback(() => {
    if (!textareaRef.current) return { textBeforeCursor: '', currentWord: '', trigger: null, currentWordStartIndex: -1 };
    const cursorPosition = textareaRef.current.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPosition);
    
    const lastAt = textBeforeCursor.lastIndexOf('@');
    // const lastDash = textBeforeCursor.lastIndexOf('-'); // Removed tag trigger
    const lastSpace = textBeforeCursor.lastIndexOf(' ');

    let triggerCharPos = -1;
    let trigger: '@' | '--' | null = null; // Changed '-' to '--' for parameters, or handle parameters differently
    let potentialWord = '';
    let currentWordStartIndex = -1; 

    // Trigger for commands
    if (lastAt > lastSpace) { // Simplified: only check @ vs space
      triggerCharPos = lastAt;
      trigger = '@';
    }
    // Check for parameter trigger (e.g., "--")
    // This part might need more sophisticated logic if parameters can be suggested independently
    // For now, parameter suggestions are tied to an active command context in updateSuggestions
    const lastDoubleDash = textBeforeCursor.lastIndexOf('--');
    if (lastDoubleDash > lastSpace && lastDoubleDash > lastAt) {
        // Check if we are in a context where a parameter is expected
        // This logic is primarily handled in updateSuggestions based on activeCommand
        // Here, we just identify if the current word starts with '--'
        const potentialParamWord = textBeforeCursor.substring(lastDoubleDash);
        if (!potentialParamWord.includes(' ') && !potentialParamWord.includes('\n')) {
            // This is a potential parameter, but suggestions are based on activeCommand
            // We can set trigger to '--' if we want to be explicit
            // trigger = '--'; // This might be redundant if updateSuggestions handles it
        }
    }
    
    // If @ is the trigger
    if (trigger === '@' && triggerCharPos !== -1) {
      potentialWord = textBeforeCursor.substring(triggerCharPos);
      if (potentialWord.includes(' ') || potentialWord.includes('\n')) {
        return { textBeforeCursor, currentWord: '', trigger: null, currentWordStartIndex: -1 };
      }
      currentWordStartIndex = triggerCharPos;
    } else { // Handle other cases, specifically for parameters after a command
        const parts = textBeforeCursor.split(/\s+/);
        const lastPart = parts[parts.length -1];
        if (lastPart.startsWith('--')) {
            potentialWord = lastPart;
            currentWordStartIndex = textBeforeCursor.length - lastPart.length;
            trigger = '--'; // Explicitly set for parameter context
        } else {
             // If not starting with @ or --, reset
            return { textBeforeCursor, currentWord: '', trigger: null, currentWordStartIndex: -1 };
        }
    }
    
    // Fallback if only potentialWord was set without a clear trigger (e.g. from parameter logic)
    if (triggerCharPos === -1 && potentialWord.startsWith('--')) {
        triggerCharPos = currentWordStartIndex; // Use the calculated start index for parameters
    }


    // Original logic for currentWord if triggerCharPos was found
    if (triggerCharPos !== -1 && (trigger === '@' || trigger === '--')) {
      potentialWord = textBeforeCursor.substring(triggerCharPos);
      if (potentialWord.includes(' ') || potentialWord.includes('\n')) {
        return { textBeforeCursor, currentWord: '', trigger: null, currentWordStartIndex: -1 };
      }
      currentWordStartIndex = triggerCharPos;
    }
    
    return { textBeforeCursor, currentWord: potentialWord, trigger, currentWordStartIndex };
  }, [value]);

  const validateCurrentCommand = useCallback(() => {
    const { textBeforeCursor } = getCursorInfo();
    
    // Find all commands in the text (commands start with @)
    const commandMatches = textBeforeCursor.match(/@(\w+)/g);
    if (!commandMatches || commandMatches.length === 0) {
      setCommandValidation({ isValid: false, missingRequiredParams: [], hasActiveCommand: false });
      setActiveCommand(null);
      return;
    }

    // Get the last command in the text
    const lastCommandMatch = commandMatches[commandMatches.length - 1];
    const commandName = lastCommandMatch.substring(1); // Remove @
    
    // Find the command definition
    const foundCommand = commands.find(cmd => cmd.name === commandName);
    if (!foundCommand) {
      setCommandValidation({ isValid: false, missingRequiredParams: [], hasActiveCommand: false });
      setActiveCommand(null);
      return;
    }

    // Set active command if it's not already set or if it's different
    if (!activeCommand || activeCommand.name !== foundCommand.name) {
      setActiveCommand(foundCommand);
    }

    // Find the start position of the last command
    const lastCommandStart = textBeforeCursor.lastIndexOf(`@${commandName}`);
    const currentCommandSegment = textBeforeCursor.substring(lastCommandStart + `@${commandName}`.length);
    const usedParams = new Set(currentCommandSegment.match(/--\w+/g) || []);
    
    const requiredParams = foundCommand.parameters?.filter(param => param.isRequired) || [];
    const missingRequiredParams = requiredParams
      .filter(param => !usedParams.has(param.name))
      .map(param => param.name);

    const isValid = missingRequiredParams.length === 0;
    
    setCommandValidation({
      isValid,
      missingRequiredParams,
      hasActiveCommand: true
    });
  }, [getCursorInfo, commands, activeCommand]);

  useEffect(() => {
    validateCurrentCommand();
  }, [value, validateCurrentCommand]);

  const calculateSuggestionsPosition = useCallback(() => {
    if (!textareaRef.current || !hiddenMirrorRef.current || !showSuggestions) {
      setSuggestionPosition(null);
      return;
    }

    const textarea = textareaRef.current;
    const mirror = hiddenMirrorRef.current;
    const { currentWordStartIndex, trigger } = getCursorInfo();

    if (trigger === null || currentWordStartIndex === -1) {
      setSuggestionPosition(null);
      return;
    }

    const style = window.getComputedStyle(textarea);
    
    const relevantStyles: (keyof CSSStyleDeclaration)[] = [
      'fontFamily', 'fontSize', 'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch',
      'letterSpacing', 'lineHeight', 'textAlign', 'textTransform', 'textIndent',
      'wordSpacing', 'direction', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'boxSizing', 'whiteSpace', 'wordWrap', 'overflowWrap', 'tabSize'
    ];
    
    relevantStyles.forEach(propKey => {
      (mirror.style as any)[propKey] = style[propKey];
    });
    
    // Override padding to match the current textarea padding state
    if (commandValidation.hasActiveCommand) {
      mirror.style.paddingTop = '2.5rem'; // pt-10 = 2.5rem
      mirror.style.paddingLeft = '0.75rem'; // px-3 = 0.75rem
      mirror.style.paddingRight = '0.75rem';
      mirror.style.paddingBottom = '0.75rem'; // pb-3 = 0.75rem
    } else {
      mirror.style.padding = '0.75rem'; // p-3 = 0.75rem
    }
    
    mirror.style.width = style.width; 
    mirror.style.position = 'absolute';
    mirror.style.visibility = 'hidden';
    mirror.style.top = '-9999px';
    mirror.style.left = '-9999px';
    mirror.style.overflow = 'hidden'; 

    const textUptoTriggerChar = value.substring(0, currentWordStartIndex);
    mirror.textContent = textUptoTriggerChar;
    
    const caretSpan = document.createElement('span');
    caretSpan.innerHTML = '​'; // Zero-width space
    mirror.appendChild(caretSpan);

    let finalLineHeight: number;
    const lhStyle = style.lineHeight;
    const fs = parseFloat(style.fontSize);

    if (lhStyle === 'normal') {
      finalLineHeight = isNaN(fs) ? 16 : fs * 1.2; 
    } else {
      const parsedLh = parseFloat(lhStyle);
      if (isNaN(parsedLh)) { 
          finalLineHeight = isNaN(fs) ? 16 : fs * 1.2;
      } else {
          if (lhStyle === String(parsedLh)) { 
              finalLineHeight = isNaN(fs) ? parsedLh * 16 : parsedLh * fs; 
          } else { 
              finalLineHeight = parsedLh; 
          }
      }
    }
    
    const caretTopInMirror = caretSpan.offsetTop;
    const caretLeftInMirror = caretSpan.offsetLeft;

    const finalTop = caretTopInMirror - textarea.scrollTop + finalLineHeight;
    const finalLeft = caretLeftInMirror - textarea.scrollLeft;
    
    setSuggestionPosition({ top: finalTop, left: finalLeft });

  }, [value, showSuggestions, getCursorInfo, commandValidation.hasActiveCommand]);

  const updateSuggestions = useCallback(() => {
    if (!enableAutocomplete || !textareaRef.current) {
      setShowSuggestions(false);
      return;
    }

    const { currentWord, trigger, textBeforeCursor } = getCursorInfo();

    if (trigger === '@' && currentWord.startsWith('@')) {
      const query = currentWord.substring(1);
      const filteredCommands = commands
        .filter(cmd => cmd.name.toLowerCase().startsWith(query.toLowerCase()))
        .map(cmd => cmd.name);
      
      setSuggestions(filteredCommands);
      setShowSuggestions(filteredCommands.length > 0);
      setCurrentContext('command');
      setActiveCommand(null); 
      setActiveSuggestionIndex(0);
    } else if (trigger === '--' && currentWord.startsWith('--') && activeCommand) { // Parameter suggestions
      // Ensure there's an active command context for parameter suggestions
      const query = currentWord.substring(2); // Remove "--"
      let potentialSuggestions: {name: string, type: 'parameter'}[] = [];

      if (activeCommand.parameters) {
        potentialSuggestions = activeCommand.parameters
          .filter(param => param.name.substring(2).toLowerCase().startsWith(query.toLowerCase()))
          .map(param => ({name: param.name, type: 'parameter'}));
      }
      
      const currentCommandSegmentStart = textBeforeCursor.lastIndexOf(`@${activeCommand.name}`);
      const currentCommandSegment = currentCommandSegmentStart !== -1 
          ? textBeforeCursor.substring(currentCommandSegmentStart + `@${activeCommand.name}`.length) 
          : ""; 
      
      // Only consider used parameters (starting with --)
      const usedArgs = new Set(currentCommandSegment.match(/--\w+/g) || []);
      
      const filteredArgs = potentialSuggestions
        .filter(arg => !usedArgs.has(arg.name) || arg.name === currentWord) 
        .map(arg => arg.name);

      setSuggestions(filteredArgs);
      setShowSuggestions(filteredArgs.length > 0);
      setCurrentContext('parameter');
      setActiveSuggestionIndex(0);
    } else if (activeCommand && !currentWord.startsWith('@') && !currentWord.startsWith('--')) {
      // This case handles suggesting parameters if the user types a space after a command
      // and we want to proactively show parameters.
      // Or if the user starts typing something that isn't a command or parameter trigger
      // but we are in an active command context.
      // For now, let's only trigger suggestions on explicit '--' or '@'.
      // To suggest parameters after a space, more logic would be needed in getCursorInfo or here.
      setShowSuggestions(false);
    }
     else {
      setShowSuggestions(false);
      // Do not reset activeCommand here, it should persist until a new command is selected
      // or the input is cleared in a way that invalidates the command context.
      // setCurrentContext(null); // Only reset context if suggestions are truly not applicable
    }
  }, [commands, enableAutocomplete, activeCommand, getCursorInfo]);

  useEffect(() => {
    updateSuggestions();
  }, [value, updateSuggestions]);

  useEffect(() => {
    if (showSuggestions) {
      calculateSuggestionsPosition();
    } else {
      setSuggestionPosition(null); 
    }
  }, [showSuggestions, value, calculateSuggestionsPosition]);

  useEffect(() => {
    const handleResizeOrScroll = () => {
      if (showSuggestions) {
        calculateSuggestionsPosition();
      }
    };
    window.addEventListener('resize', handleResizeOrScroll);
    const taRef = textareaRef.current;
    if (taRef) {
        taRef.addEventListener('scroll', handleResizeOrScroll);
    }
    return () => {
        window.removeEventListener('resize', handleResizeOrScroll);
        if (taRef) {
            taRef.removeEventListener('scroll', handleResizeOrScroll);
        }
    };
  }, [showSuggestions, calculateSuggestionsPosition]);


  const handleSuggestionClick = (suggestion: string) => {
    if (!textareaRef.current) return;
    const originalCursorPos = textareaRef.current.selectionStart;

    const { currentWordStartIndex } = getCursorInfo(); 

    if (currentWordStartIndex === -1 && currentContext !== null) { // Allow if context is set but no specific word (e.g. after space)
        // This case might need more specific handling if we want to insert at cursor without replacing
        // For now, if currentWordStartIndex is -1, it implies we don't have a clear trigger point to replace from.
        // Let's assume the user clicked a suggestion without a valid partial word.
        // We'll insert at the original cursor position.
        const textBeforeOriginalCursor = value.substring(0, originalCursorPos);
        const textAfterOriginalCursor = value.substring(originalCursorPos);
        let textToInsertSimple: string;

        if (currentContext === 'command') {
            textToInsertSimple = "@" + suggestion + " ";
            const cmd = commands.find(c => c.name === suggestion);
            if (cmd) setActiveCommand(cmd);
        } else if (currentContext === 'parameter') {
            textToInsertSimple = suggestion + " ";
        } else {
            textToInsertSimple = suggestion;
        }
        
        const newValueSimple = textBeforeOriginalCursor + textToInsertSimple + textAfterOriginalCursor;
        onValueChange(newValueSimple);
        setShowSuggestions(false);
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.focus();
                const newCursorPosSimple = originalCursorPos + textToInsertSimple.length;
                textareaRef.current.setSelectionRange(newCursorPosSimple, newCursorPosSimple);
            }
        }, 0);
        return;
    }
    
    // If currentWordStartIndex is valid, proceed with replacement logic
    if (currentWordStartIndex === -1) {
        // This should ideally not be reached if the above block handles it,
        // but as a fallback or if context is null.
        console.warn("handleSuggestionClick: No valid trigger for suggestion. currentWordStartIndex is -1.");
        return;
    }


    let textToInsert: string;

    if (currentContext === 'command') {
      textToInsert = "@" + suggestion + " "; 
      const cmd = commands.find(c => c.name === suggestion);
      if (cmd) setActiveCommand(cmd);
    } else if (currentContext === 'parameter') {
      textToInsert = suggestion + " ";
    } else {
      // This case should ideally not be hit if context is managed properly
      console.warn("handleSuggestionClick: Unknown or null context", currentContext);
      textToInsert = suggestion; 
    }
    
    const textBeforeTrigger = value.substring(0, currentWordStartIndex);
    const textAfterOriginalCursor = value.substring(originalCursorPos);
    
    const newValue = textBeforeTrigger + textToInsert + textAfterOriginalCursor;
    onValueChange(newValue);
    
    setShowSuggestions(false);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newAbsoluteCursorPosition = currentWordStartIndex + textToInsert.length;
        textareaRef.current.setSelectionRange(newAbsoluteCursorPosition, newAbsoluteCursorPosition);
      }
    }, 0);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveSuggestionIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (suggestions[activeSuggestionIndex]) { 
            handleSuggestionClick(suggestions[activeSuggestionIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setShowSuggestions(false);
      }
    } else {
      // Handle Enter and Shift+Enter when no suggestions are showing
      if (e.key === 'Enter') {
        if (e.shiftKey) {
          // Shift+Enter: Allow normal behavior (new line)
          return;
        } else {
          // Enter: Submit the form only if not disabled
          e.preventDefault();
          if (onSubmit && !submitDisabled) {
            onSubmit();
          }
        }
      }
    }
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onValueChange(e.target.value);
  };

  useEffect(() => {
    if (showSuggestions && suggestionsRef.current && suggestionsRef.current.children[activeSuggestionIndex]) {
      suggestionsRef.current.children[activeSuggestionIndex].scrollIntoView({
        block: 'nearest',
        inline: 'nearest'
      });
    }
  }, [activeSuggestionIndex, showSuggestions]);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={() => { 
            updateSuggestions(); 
        }}
        className={`w-full bg-dark_blue text-white border rounded-md focus:ring-2 focus:outline-none resize-none transition-all duration-200 ${
          commandValidation.hasActiveCommand 
            ? 'pt-10 px-3 pb-3' // Add top padding when validation indicator is shown
            : 'p-3'
        } ${
          submitDisabled 
            ? 'border-yellow-500/40 focus:ring-yellow-500/50 focus:border-yellow-500/60' 
            : 'border-light_blue-500/20 focus:ring-light_blue-500 focus:border-light_blue-500'
        }`}
        {...textareaProps}
      />
      {/* Command Validation Indicator */}
      {commandValidation.hasActiveCommand && (
        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded text-xs pointer-events-none z-10">
          {commandValidation.isValid ? (
            <div className="flex items-center gap-1 bg-green-500/90 border border-green-500/60 px-2 py-1 rounded backdrop-blur-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-green-100 font-medium">Valid</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-red-500/90 border border-red-500/60 px-2 py-1 rounded backdrop-blur-sm">
              <div className="w-2 h-2 bg-red-400 rounded-full"></div>
              <span className="text-red-100 font-medium">
                Missing: {commandValidation.missingRequiredParams.map(param => param.replace('--', '')).join(', ')}
              </span>
            </div>
          )}
        </div>
      )}
      {submitDisabled && (
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-yellow-500/20 border border-yellow-500/40 rounded text-xs text-yellow-300 pointer-events-none">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Sending...</span>
        </div>
      )}
      {enableAutocomplete && showSuggestions && suggestions.length > 0 && suggestionPosition && (
        <ul
          ref={suggestionsRef}
          className="absolute z-10 mt-1 max-h-60 overflow-y-auto bg-modal_bg border border-light_blue-500/80 rounded-md shadow-lg py-1"
          style={{
            top: `${suggestionPosition.top}px`,
            left: `${suggestionPosition.left}px`,
            minWidth: '150px', 
            width: 'auto',     
          }}
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion}
              className={`px-3 py-2 cursor-pointer text-light_blue hover:bg-light_blue-500/20 ${
                index === activeSuggestionIndex ? 'bg-light_blue-500/20' : ''
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setActiveSuggestionIndex(index)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <span className="font-medium">{suggestion}</span>
                  {(() => {
                    let description = '';
                    if (currentContext === 'command') {
                      const cmd = commands.find(c => c.name === suggestion);
                      description = cmd?.description || '';
                    } else if (activeCommand && currentContext === 'parameter') {
                      const param = activeCommand.parameters?.find(p => p.name === suggestion);
                      description = param?.description || '';
                      if (param?.placeholder) description += ` (e.g., ${param.placeholder})`;
                    }
                    return description ? (
                      <div className="text-xs text-light_blue/70 mt-1">{description}</div>
                    ) : null;
                  })()}
                </div>
                {currentContext === 'parameter' && (() => {
                  const param = activeCommand?.parameters?.find(p => p.name === suggestion);
                  const isRequired = param?.isRequired || false;
                  return isRequired ? (
                    <span className="ml-2 text-xs text-red-400 font-semibold flex-shrink-0">*required</span>
                  ) : (
                    <span className="ml-2 text-xs text-gray-400 flex-shrink-0">optional</span>
                  );
                })()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AutoCompleteTextArea;
