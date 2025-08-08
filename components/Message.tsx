import React from 'react';
import { ChatMessage, MessageSender, Curriculum, Topic } from '../types';
import { UserCircleIcon, SparklesIcon, CheckCircleIcon, CodeBracketIcon, PlayIcon, ClockIcon } from './icons';

// Helper to parse duration string like "5-10 mins" into numbers
const parseDuration = (duration: string): [number, number] => {
  const parts = (duration || '0 mins').replace(/ mins/g, '').split('-');
  if (parts.length === 2) {
    const min = parseInt(parts[0], 10);
    const max = parseInt(parts[1], 10);
    return [isNaN(min) ? 0 : min, isNaN(max) ? 0 : max];
  }
  const val = parseInt(parts[0], 10);
  return [isNaN(val) ? 0 : val, isNaN(val) ? 0 : val];
};

const CurriculumMap: React.FC<{ curriculum: Curriculum }> = ({ curriculum }) => {
  const { totalMin, totalMax } = curriculum.topics.reduce(
    (acc, topic) => {
      const [min, max] = parseDuration(topic.duration);
      acc.totalMin += min;
      acc.totalMax += max;
      return acc;
    },
    { totalMin: 0, totalMax: 0 }
  );

  return (
    <div className="mt-4 mb-2 p-5 bg-indigo-50 border border-indigo-100 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-indigo-700">{curriculum.title}</h3>
        <div className="flex items-center text-sm font-medium text-gray-500">
          <ClockIcon className="w-5 h-5 mr-1.5 text-gray-400" />
          <span>Est. {totalMin}-{totalMax} mins</span>
        </div>
      </div>
      <ul className="space-y-3">
        {curriculum.topics.map((topic, index) => {
          const isCompleted = topic.completed;
          const isCurrent = !isCompleted && (index === 0 || curriculum.topics[index - 1].completed);
          
          const getIcon = () => {
            if (isCompleted) {
              return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
            }
            if (isCurrent) {
              return <PlayIcon className="w-5 h-5 text-indigo-600" />;
            }
            // Upcoming
            return (
              <div className="w-5 h-5 bg-gray-300 rounded-full" />
            );
          };

          const getTextClass = () => {
            if (isCompleted) {
              return 'text-gray-500 line-through';
            }
            if (isCurrent) {
              return 'text-indigo-700 font-bold';
            }
            return 'text-gray-700';
          };

          return (
            <li key={index} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="mr-3 w-6 h-6 flex items-center justify-center flex-shrink-0">
                  {getIcon()}
                </span>
                <span className={`font-medium ${getTextClass()}`}>
                  {topic.name}
                </span>
              </div>
              <span className="text-sm text-gray-500 font-medium">{topic.duration}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};


const ThinkingIndicator: React.FC = () => (
    <div className="flex items-center space-x-2">
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse"></div>
    </div>
);

const Message: React.FC<{ message: ChatMessage; curriculum: Curriculum | null }> = ({ message, curriculum }) => {
  const { sender, text, isThinking, meta } = message;
  const effectiveCurriculum = meta?.curriculum || curriculum;

  const renderText = (txt: string) => {
    return txt.split(/(\[CURRICULUM_MAP\])/).map((part, index) => {
      if (part === '[CURRICULUM_MAP]') {
        return effectiveCurriculum ? <CurriculumMap key={index} curriculum={effectiveCurriculum} /> : null;
      }
      
      const cleanPart = part.replace(/\[SHOW_ACTIONS\]/g, '');

      // Basic markdown for bold, italics (for actions), and code blocks
      let html = cleanPart
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-800 text-white p-4 rounded-md my-2 custom-scrollbar overflow-x-auto"><code class="font-mono text-sm">$1</code></pre>');
      return <div key={index} dangerouslySetInnerHTML={{ __html: html }} className="prose prose-indigo max-w-none" />;
    });
  };

  if (sender === MessageSender.SYSTEM) {
    return (
      <div className="flex items-start bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg text-green-800">
        <CheckCircleIcon className="w-6 h-6 mr-3 flex-shrink-0" />
        <div>
          <p className="font-semibold">Success!</p>
          <div className="prose prose-green max-w-none">{renderText(text)}</div>
        </div>
      </div>
    )
  }

  const isUser = sender === MessageSender.USER;
  const wrapperClass = isUser ? 'flex justify-end' : 'flex justify-start';
  const bubbleClass = isUser
    ? 'bg-indigo-600 text-white'
    : 'bg-white text-gray-800 border border-gray-200';
  const icon = isUser ? (
    <UserCircleIcon className="w-10 h-10 text-gray-400 ml-3" />
  ) : (
    <SparklesIcon className="w-10 h-10 text-indigo-500 mr-3" />
  );

  return (
    <div className={`${wrapperClass} items-start`}>
      {!isUser && icon}
      <div className={`max-w-2xl p-4 rounded-2xl shadow-sm ${bubbleClass}`}>
        {isThinking ? <ThinkingIndicator /> : renderText(text)}
      </div>
      {isUser && icon}
    </div>
  );
};

export default Message;