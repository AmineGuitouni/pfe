// src/app/page.tsx (or any other component)
"use client";

import { useMemo, useState } from 'react';
// Adjust path if your AutoCompleteTextArea.tsx is in a different location, e.g., '../components/AutoCompleteTextArea'
import AutoCompleteTextArea from './AutoCompleteTextArea'; 
import { useParams, usePathname } from 'next/navigation';
import { useCommandCenterContext } from '../context/CommandCenterContext';
import { Button } from '@heroui/react';
import { predefinedCommands } from '../contants';

export default function CommandInput() {
  const [textValue, setTextValue] = useState('');
  const pathName = usePathname()
  const mode: "cli" | "chat" | null = useMemo(()=>{
    const isAgent = pathName.includes('chat')
    if(isAgent) return 'chat';
    const isCli = pathName.includes('cli')
    if(isCli) return 'cli';
    return null
  },[pathName])
  const autocompleteEnabled = useMemo(()=>{
    if(mode === 'cli') return true;
    if(mode === 'chat') return false;
    return textValue.startsWith("@");
  },[textValue, mode])

  

  const {SendMessage, sendingMessage} = useCommandCenterContext();
  const {command_center_session} = useParams();

  const handleSubmit = async () => {
    if (textValue.trim()) {
      setTextValue('');
      await SendMessage(textValue);
    }
  };

  return (
    <div className="mb-4 flex flex-col items-center mx-auto w-full max-w-[1200px] px-4 md:px-6 lg:px-14 xl:px-24 2xl:px-28">

      <div className="w-full px-3">
        <AutoCompleteTextArea
          value={textValue}
          onValueChange={setTextValue}
          commands={predefinedCommands}
          enableAutocomplete={autocompleteEnabled}
          placeholder={mode === 'cli' ? "Enter CLI command..." : mode === 'chat' ? "Type your message..." : "Type @ for commands or enter text..."}
          rows={command_center_session ? 3 : 8}
          onSubmit={handleSubmit}
          submitDisabled={sendingMessage}
        />
        <Button
          onPress={handleSubmit}
          isDisabled={sendingMessage}
          isLoading={sendingMessage}
          className="bg-light_blue hover:bg-light_blue-500 text-black w-full"
        >
          {mode === 'cli' ? 'Execute Command' : mode === 'chat' ? 'Send Message' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
