import { useState, useEffect } from "react";
import { ApiLesson, QuizQuestion, fixMediaUrls, LESSON_CONTENT, LESSON_QUIZ } from "../topicConstants";

export function useTopicContent(
  topicId: string | undefined,
  useApi: boolean,
  apiLesson: ApiLesson | null,
) {
  const [content,   setContent]   = useState<unknown>(null);
  const [videoLink, setVideoLink] = useState<string | null>(null);
  const [quiz,      setQuiz]      = useState<QuizQuestion[]>([]);
  const [answers,   setAnswers]   = useState<Record<number, number[]>>({});
  const [checked,   setChecked]   = useState(false);

  useEffect(() => {
    if (useApi) {
      if (apiLesson) {
        const raw = apiLesson.content as Record<string, unknown> | null;
        const doc = raw && typeof raw === "object" && raw.lesson_text ? raw.lesson_text : raw;
        setContent(fixMediaUrls(doc));
        const vl = (doc as Record<string, unknown>)?.videoLink;
        setVideoLink(typeof vl === "string" ? vl : null);
      }
      return;
    }
    setVideoLink(null);
    const loader = LESSON_CONTENT[topicId ?? ""];
    if (loader) loader().then(m => setContent(m.default));
    else setContent(null);

    const quizLoader = LESSON_QUIZ[topicId ?? ""];
    if (quizLoader) quizLoader().then(m => { setQuiz(m.default as QuizQuestion[]); setAnswers({}); setChecked(false); });
    else { setQuiz([]); setAnswers({}); setChecked(false); }
  }, [topicId, useApi, apiLesson]);

  return { content, videoLink, quiz, answers, setAnswers, checked, setChecked };
}
