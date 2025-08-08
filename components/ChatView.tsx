import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GradeLevel, Curriculum, ChatMessage, MessageSender, Topic, StudentProgress } from '../types';
import { CURRICULUMS, CODE_EVALUATION_PROMPT } from '../constants';
import { getAiResponse, evaluateCode, getStudentProgress, saveStudentProgress } from '../services/apiService';
import Message from './Message';
import { PaperAirplaneIcon, CodeBracketIcon, SparklesIcon, QuestionMarkCircleIcon } from './icons';
import { useTerminal } from '../hooks/useTerminal';

const GradeSelector: React.FC<{ onSelect: (grade: GradeLevel) => void }> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-gray-800 mb-3">Welcome to Code Buddy!</h1>
        <p className="text-lg text-gray-600 mb-8">It's great to meet you! To get started on your coding adventure, please select your grade level.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(Object.keys(CURRICULUMS) as GradeLevel[]).map(level => (
            <button
              key={level}
              onClick={() => onSelect(level)}
              className="p-8 bg-white rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transform transition-all duration-300 text-left"
            >
              <h2 className="text-2xl font-bold text-indigo-600">{level}</h2>
              <p className="text-sm text-gray-500 mb-2">Grades {level === 'JUNIOR' ? '4-6' : level === 'EXPLORER' ? '7-9' : '10-12'}</p>
              <p className="font-semibold text-gray-700">{CURRICULUMS[level].title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface ContextualAction {
  label: string;
  prompt: string | null;
}

const ChatView: React.FC<{ studentName: string }> = ({ studentName }) => {
  const { terminalId } = useTerminal();
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [contextualActions, setContextualActions] = useState<ContextualAction[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load student progress on mount
  useEffect(() => {
    if (!terminalId || !studentName) return;
    setIsLoading(true);
    getStudentProgress(terminalId, studentName)
      .then(loadedProgress => {
        setProgress(loadedProgress);
      })
      .catch(error => console.error("Failed to load progress:", error))
      .finally(() => setIsLoading(false));
  }, [terminalId, studentName]);
  
  // Save progress whenever it changes
  useEffect(() => {
    if (progress && terminalId && studentName) {
      saveStudentProgress(terminalId, studentName, progress);
    }
  }, [progress, terminalId, studentName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [progress?.history]);

  const processAiResponse = (text: string) => {
    let responseText = text;
    if (responseText.includes('[SHOW_ACTIONS]')) {
      responseText = responseText.replace('[SHOW_ACTIONS]', '').trim();
      setContextualActions([
        { label: "Yep, I got it!", prompt: "I understand. What's the challenge?" },
        { label: "Explain it differently", prompt: "Can you please explain that in a different way?" },
        { label: "I have a question...", prompt: null },
      ]);
    } else {
      setContextualActions([]);
    }
    return responseText;
  };

  const updateMessages = (newMessage: ChatMessage) => {
    setProgress(prev => {
        if (!prev) return null;
        return {
            ...prev,
            history: [...prev.history, newMessage]
        }
    });
  }
  
  const handleGradeSelect = useCallback((selectedGrade: GradeLevel) => {
    const initialCurriculum = JSON.parse(JSON.stringify(CURRICULUMS[selectedGrade]));
    const firstTopic = initialCurriculum.topics[0].name;
    const welcomeText = `Great choice! We'll start with the ${initialCurriculum.title}.
[CURRICULUM_MAP]
Let's begin our journey with our first topic: **${firstTopic}**.`;

    const initialHistory: ChatMessage[] = [
      { id: 'start', sender: MessageSender.AI, text: welcomeText, meta: { curriculum: initialCurriculum } }
    ];
    
    const newProgress: StudentProgress = {
        grade: selectedGrade,
        curriculum: initialCurriculum,
        history: initialHistory
    };
    setProgress(newProgress);
    
    setIsThinking(true);
    // Note: The history sent here is empty because it's the very first message for the AI
    getAiResponse(terminalId!, studentName, `The student chose grade ${selectedGrade}. Start by teaching the first topic: ${firstTopic}.`, [])
      .then(aiResponse => {
        const responseText = processAiResponse(aiResponse);
        updateMessages({ id: Date.now().toString(), sender: MessageSender.AI, text: responseText });
      })
      .finally(() => setIsThinking(false));
  }, [terminalId, studentName]);

  const handleSendMessage = useCallback(async (messageText: string, fromAction = false) => {
    if (!messageText.trim() || !progress) return;

    if (!fromAction) {
        const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: MessageSender.USER, text: messageText };
        updateMessages(newUserMessage);
    }
    
    setInput('');
    setIsThinking(true);
    setContextualActions([]);

    const codeBlockRegex = /```[\s\S]*?```/;
    const runCommandRegex = /\/\/\s*run/;
    const hasCodeBlock = codeBlockRegex.test(messageText);
    const hasRunCommand = runCommandRegex.test(messageText);
    
    if (hasCodeBlock && hasRunCommand && !fromAction) {
      const code = messageText.match(codeBlockRegex)?.[0].replace(/```(python|javascript|)\n?|```/g, '').replace(/\/\/\s*run/, '').trim() || '';
      const currentTopic = progress.curriculum.topics.find(t => !t.completed)?.name || 'the current topic';
      
      const evaluationPrompt = CODE_EVALUATION_PROMPT(currentTopic, code);
      const evalResult = await evaluateCode(terminalId!, studentName, evaluationPrompt);

      if (evalResult.startsWith('CODE_CORRECT')) {
        const successMessage = evalResult.replace('CODE_CORRECT\n', '');
        updateMessages({ id: `success-${Date.now()}`, sender: MessageSender.SYSTEM, text: successMessage });

        const newCurriculum = JSON.parse(JSON.stringify(progress.curriculum));
        const topicIndex = newCurriculum.topics.findIndex((t: Topic) => !t.completed);
        if (topicIndex !== -1) {
            newCurriculum.topics[topicIndex].completed = true;
        }

        const nextTopic = newCurriculum.topics.find((t: Topic) => !t.completed);
        const transitionPrompt = `The student successfully completed the challenge for "${currentTopic}". Your task is to transition to the next lesson.
1. Start with a warm, celebratory message like "Shabash!" or "Well done!".
2. On a new line, output the special command: [CURRICULUM_MAP]
3. On another new line, start teaching the next topic: "${nextTopic ? nextTopic.name : 'the final project'}". If there are no more topics, congratulate them on finishing the curriculum.`;

        const transitionResponse = await getAiResponse(terminalId!, studentName, transitionPrompt, progress.history);
        const responseText = processAiResponse(transitionResponse);
        
        // This message needs to carry the new curriculum state
        const aiTransitionMessage = { id: `transition-${Date.now()}`, sender: MessageSender.AI, text: responseText, meta: { curriculum: newCurriculum } };
        
        // Update the main progress state before adding the final message
        setProgress(prev => prev ? ({ ...prev, curriculum: newCurriculum, history: [...prev.history, aiTransitionMessage] }) : null);

      } else {
        const errorMessage = evalResult.replace('CODE_INCORRECT\n', '');
        updateMessages({ id: `error-${Date.now()}`, sender: MessageSender.AI, text: errorMessage });
      }
    } else {
      const historyForApi = progress.history.filter(m => m.sender !== MessageSender.SYSTEM);
      const aiResponse = await getAiResponse(terminalId!, studentName, messageText, historyForApi);
      const responseText = processAiResponse(aiResponse);
      updateMessages({ id: Date.now().toString() + 'ai', sender: MessageSender.AI, text: responseText });
    }
    
    setIsThinking(false);
  }, [progress, terminalId, studentName]);

  const handleActionClick = (action: ContextualAction) => {
    setContextualActions([]);
    if (action.prompt) {
      const userActionMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: MessageSender.USER,
        text: `*${action.label}*`,
      };
      updateMessages(userActionMessage);
      handleSendMessage(action.prompt, true);
    } else {
      inputRef.current?.focus();
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><SparklesIcon className="w-12 h-12 text-indigo-500 animate-pulse" /></div>;
  }

  if (!progress) {
    return <GradeSelector onSelect={handleGradeSelect} />;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6">
          {progress.history.map((msg) => (
            <Message key={msg.id} message={msg} curriculum={progress.curriculum} />
          ))}
          {isThinking && <Message message={{ id: 'thinking', sender: MessageSender.AI, text: '', isThinking: true }} curriculum={progress.curriculum} />}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          {contextualActions.length > 0 && !isThinking && (
            <div className="flex flex-wrap justify-center gap-3 mb-4 animate-fade-in">
              {contextualActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => handleActionClick(action)}
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 font-semibold rounded-full hover:bg-indigo-200 transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-px"
                >
                  {action.label === "I have a question..." ? <QuestionMarkCircleIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                  {action.label}
                </button>
              ))}
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(input); }} className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              placeholder="Type your message or code here... Add // run to execute code."
              className="w-full p-4 pr-20 text-gray-700 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              rows={2}
              disabled={isThinking}
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
            >
              <PaperAirplaneIcon className="w-6 h-6" />
            </button>
          </form>
          <div className="flex items-center text-xs text-gray-500 mt-2 ml-2">
            <CodeBracketIcon className="w-4 h-4 mr-1" />
            <span>To run code, wrap it in a markdown block (```) and add <strong className="font-semibold text-gray-700">// run</strong> on the last line.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
