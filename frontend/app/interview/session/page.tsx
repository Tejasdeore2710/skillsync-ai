"use client";

import { useEffect, useRef, useState } from "react";
import { apiRequest } from "../../../lib/api";
import { useRouter } from "next/navigation";
import { getToken } from "../../../lib/auth";

export default function InterviewSessionPage() {
  const router = useRouter();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);

  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);

  const [interview, setInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);

  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [showEndModal, setShowEndModal] = useState(false);

  const [loadingInterview, setLoadingInterview] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [finalReport, setFinalReport] = useState<any>(null);

  const [transcript, setTranscript] = useState<
    { speaker: "AI" | "You"; text: string; time: string }[]
  >([]);

  /* ================= AUTH ================= */

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  /* ================= INTERVIEW BACKEND ================= */

  const getInterviewId = () => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("id");
  };

  const unwrapResponse = (response: any) =>
    response?.data?.interview ??
    response?.data ??
    response?.interview ??
    response;

  const getQuestionText = (question: any) => {
    if (typeof question === "string") return question;

    return (
      question?.question ??
      question?.text ??
      question?.prompt ??
      "Interview question unavailable."
    );
  };

  const getCurrentQuestionObject = () =>
    questions[currentQuestion - 1] ?? null;

  const getCurrentQuestionText = () =>
    getQuestionText(getCurrentQuestionObject());

  const formatInterviewDuration = (duration: unknown) => {
    const minutes =
      typeof duration === "number"
        ? duration
        : Number.parseInt(String(duration ?? ""), 10);

    return Number.isFinite(minutes) && minutes > 0 ? minutes * 60 : 30 * 60;
  };

  useEffect(() => {
    let cancelled = false;

    const loadInterview = async () => {
      const token = getToken();
      const interviewId = getInterviewId();

      if (!token) {
        router.replace("/login");
        return;
      }

      if (!interviewId) {
        setError("Interview ID is missing. Please start a new interview.");
        setLoadingInterview(false);
        return;
      }

      try {
        setLoadingInterview(true);
        setError("");

        const response = await apiRequest<any>(`/interviews/${interviewId}`, {
          method: "GET",
          token,
        });

        const interviewData = unwrapResponse(response);
        const loadedQuestions = Array.isArray(interviewData?.questions)
          ? interviewData.questions
          : [];

        if (!loadedQuestions.length) {
          throw new Error(
            "No interview questions were generated for this session."
          );
        }

        if (cancelled) return;

        setInterview(interviewData);
        setQuestions(loadedQuestions);
        setCurrentQuestion(1);
        setTimeLeft(formatInterviewDuration(interviewData?.duration));

        const firstQuestion = getQuestionText(loadedQuestions[0]);

        setTranscript([
          {
            speaker: "AI",
            text: firstQuestion,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);

        try {
          await apiRequest<any>(`/interviews/${interviewId}/start`, {
            method: "PUT",
            token,
          });
        } catch (startError) {
          console.warn("Interview start update failed:", startError);
        }
      } catch (loadError) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the interview."
        );
      } finally {
        if (!cancelled) setLoadingInterview(false);
      }
    };

    loadInterview();

    return () => {
      cancelled = true;
    };
  }, [router]);

  useEffect(() => {
    const current = getCurrentQuestionObject();

    if (!current) return;

    const questionText = getQuestionText(current);

    setTranscript((previous) => {
      const last = previous[previous.length - 1];

      if (last?.speaker === "AI" && last.text === questionText) {
        return previous;
      }

      return [
        ...previous,
        {
          speaker: "AI",
          text: questionText,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ];
    });
  }, [currentQuestion, questions]);

  const normalizeEvaluation = (result: any) => {
    const evaluationData =
      result?.evaluation ??
      result?.data?.evaluation ??
      result?.data?.result ??
      result?.result ??
      result?.data ??
      result;

    return evaluationData;
  };

  const submitAnswer = async () => {
    const trimmedAnswer = answer.trim();

    if (!trimmedAnswer || isSubmitting || !questions.length) return;

    const token = getToken();
    const interviewId = getInterviewId();

    if (!token || !interviewId) {
      setError("Authentication or interview session is missing.");
      return;
    }

    try {
      window.speechSynthesis?.cancel();
      setIsAISpeaking(false);
      setIsSubmitting(true);
      setError("");
      setShowEvaluation(false);
      setEvaluation(null);

      const response = await apiRequest<any>(
        `/interviews/${interviewId}/answer`,
        {
          method: "POST",
          token,
          body: JSON.stringify({
            questionIndex: currentQuestion - 1,
            questionId: getCurrentQuestionObject()?._id,
            question: getCurrentQuestionText(),
            answer: trimmedAnswer,
          }),
        }
      );

      const evaluated = normalizeEvaluation(response);
      setEvaluation(evaluated);
      setShowEvaluation(true);

      setTranscript((previous) => [
        ...previous,
        {
          speaker: "You",
          text: trimmedAnswer,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);

      setAnswer("");
      setIsListening(false);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to evaluate your answer."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveToNextQuestion = () => {
    window.speechSynthesis?.cancel();
    setIsAISpeaking(false);
    setShowEvaluation(false);
    setEvaluation(null);

    if (currentQuestion < questions.length) {
      setCurrentQuestion((previous) => previous + 1);
      return;
    }

    completeInterview();
  };

  const completeInterview = async () => {
    if (isCompleting) return;

    const token = getToken();
    const interviewId = getInterviewId();

    if (!token || !interviewId) {
      setError("Authentication or interview session is missing.");
      return;
    }

    try {
      setIsCompleting(true);
      setError("");

      const response = await apiRequest<any>(
        `/interviews/${interviewId}/complete`,
        {
          method: "PUT",
          token,
        }
      );

      const report = unwrapResponse(response);

      setFinalReport(report);
      setShowEndModal(false);
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : "Unable to complete the interview."
      );
    } finally {
      setIsCompleting(false);
    }
  };

  const handleEndInterview = async () => {
    await completeInterview();
  };

    /* ================= CAMERA ================= */

  useEffect(() => {
    let mounted = true;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Camera/Microphone permission error:", error);
      }
    };

    startCamera();

    return () => {
      mounted = false;

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  /* ================= TIMER ================= */

  useEffect(() => {
    if (timeLeft <= 0) {
      void completeInterview();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  /* ================= FORMAT TIMER ================= */

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  /* ================= CAMERA CONTROL ================= */

  const toggleCamera = () => {
    const videoTrack = streamRef.current?.getVideoTracks()[0];

    if (!videoTrack) return;

    const nextState = !cameraOn;

    videoTrack.enabled = nextState;
    setCameraOn(nextState);
  };

  /* ================= MIC CONTROL ================= */

  const toggleMic = () => {
    const audioTrack = streamRef.current?.getAudioTracks()[0];

    if (!audioTrack) return;

    const nextState = !micOn;

    audioTrack.enabled = nextState;
    setMicOn(nextState);
  };

  /* ================= SCREEN SHARE ================= */

  const toggleScreenShare = async () => {
    try {
      if (screenSharing) {
        setScreenSharing(false);

        const videoTrack = streamRef.current?.getVideoTracks()[0];

        if (videoTrack) {
          videoTrack.enabled = cameraOn;
        }

        return;
      }

      const screenStream =
        await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });

      const screenTrack = screenStream.getVideoTracks()[0];

      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
      }

      setScreenSharing(true);

      screenTrack.onended = () => {
        setScreenSharing(false);

        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;
        }
      };
    } catch (error) {
      console.error("Screen sharing cancelled:", error);
    }
  };

  /* ================= AI VOICE INTERVIEWER ================= */

  const speakQuestion = (questionText?: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceSupported(false);
      setError(
        "AI voice is not supported in this browser. You can continue with the text interview."
      );
      return;
    }

    const textToSpeak = (questionText || getCurrentQuestionText()).trim();

    if (!textToSpeak || loadingInterview || finalReport) return;

    const synth = window.speechSynthesis;

    synth.cancel();
    setIsAISpeaking(true);
    setError("");

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    utterance.lang = "en-US";
    utterance.rate = 0.92;
    utterance.pitch = 1;
    utterance.volume = 1;

    const chooseVoice = () => {
      const voices = synth.getVoices();

      const preferredVoice =
        voices.find(
          (voice) =>
            voice.lang.toLowerCase().startsWith("en-us") &&
            /aria|jenny|samantha|zira|female/i.test(voice.name)
        ) ||
        voices.find(
          (voice) => voice.lang.toLowerCase().startsWith("en")
        );

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      synth.speak(utterance);
    };

    utterance.onstart = () => {
      setIsAISpeaking(true);
    };

    utterance.onend = () => {
      setIsAISpeaking(false);
    };

    utterance.onerror = (event) => {
      console.warn("AI speech error:", event);
      setIsAISpeaking(false);
      setError("AI voice could not be played. Use Listen again or continue with text.");
    };

    if (synth.getVoices().length > 0) {
      chooseVoice();
    } else {
      synth.addEventListener("voiceschanged", chooseVoice, { once: true });
      window.setTimeout(() => {
        synth.removeEventListener("voiceschanged", chooseVoice);
        if (!synth.speaking && !synth.pending) {
          chooseVoice();
        }
      }, 800);
    }
  };

  const stopAISpeaking = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    setIsAISpeaking(false);
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    setVoiceSupported("speechSynthesis" in window);

    const handleVoicesChanged = () => {
      window.speechSynthesis.getVoices();
    };

    window.speechSynthesis.addEventListener(
      "voiceschanged",
      handleVoicesChanged
    );

    return () => {
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        handleVoicesChanged
      );
      window.speechSynthesis.cancel();
    };
  }, []);

  useEffect(() => {
    const questionText = getCurrentQuestionText();

    if (!questionText || loadingInterview || finalReport || !voiceSupported) {
      return;
    }

    const timer = window.setTimeout(() => {
      speakQuestion(questionText);
    }, 700);

    return () => {
      window.clearTimeout(timer);
      window.speechSynthesis.cancel();
      setIsAISpeaking(false);
    };
  }, [currentQuestion, questions, loadingInterview, voiceSupported]);

  /* ================= VOICE INPUT ================= */

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop?.();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice input is not supported in this browser. Please type your answer."
      );
      return;
    }

    stopAISpeaking();

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setError("");
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalText = "";

      for (
        let index = event.resultIndex;
        index < event.results.length;
        index++
      ) {
        finalText += event.results[index][0].transcript;
      }

      setAnswer((previous) => `${previous} ${finalText}`.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice input could not be captured. You can type your answer.");
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.start();
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#111827]">
      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <header className="flex h-[72px] items-center justify-between border-b border-[#e5e7eb] bg-white px-5 lg:px-7">
        {/* LOGO */}

        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-sm font-bold shadow-lg shadow-[#635bff]/20">
            S
          </div>

          <div>
            <p className="text-sm font-bold">
              SkillSync<span className="text-[#8b7cff]"> AI</span>
            </p>

            <p className="text-[9px] uppercase tracking-[0.16em] text-[#9ca3af]">
              AI Interview
            </p>
          </div>
        </div>

        {/* CENTER STATUS */}

        <div className="hidden items-center gap-3 md:flex">
          <div className="rounded-xl border border-[#635bff]/20 bg-[#635bff]/5 px-4 py-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider text-[#635bff]">
              Live Interview
            </p>
          </div>

          <div className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fc] px-4 py-2">
            <p className="text-xs font-semibold text-[#374151]">
              Question {currentQuestion} of {questions.length || 10}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />

            <span className="font-mono text-xs font-semibold text-red-600">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* END */}

        <button
          type="button"
          onClick={() => setShowEndModal(true)}
          className="rounded-xl border border-red-500/25 bg-red-50 px-4 py-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
        >
          End Interview
        </button>
      </header>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="mx-auto max-w-[1600px] p-4 lg:p-6">
        {loadingInterview && (
          <div className="mb-5 rounded-2xl border border-[#635bff]/20 bg-[#635bff]/10 px-4 py-3 text-xs text-[#635bff]">
            Generating your personalized interview questions...
          </div>
        )}

        {/* MOBILE STATUS */}

        <div className="mb-4 flex items-center justify-between gap-2 md:hidden">
          <div className="rounded-lg bg-[#635bff]/10 px-3 py-2 text-[10px] font-semibold text-[#635bff]">
            Question {currentQuestion}/{questions.length || 10}
          </div>

          <div className="rounded-lg bg-red-50 px-3 py-2 font-mono text-[10px] text-red-600">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* =================================================
              LEFT / MAIN INTERVIEW AREA
          ================================================== */}

          <section>
            {/* HEADER */}

            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8b7cff]">
                  AI Interview
                </p>

                <h1 className="mt-1 text-xl font-bold text-[#111827]">
                  {interview?.role || "Software Engineer"} Interview
                </h1>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <span className="flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Recording
                </span>
              </div>
            </div>

            {/* VIDEO GRID */}

            <div className="grid gap-4 lg:grid-cols-2">
              {/* AI VIDEO */}

              <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#e5e7eb] bg-gradient-to-br from-[#eef2ff] via-[#f5f3ff] to-[#ffffff] shadow-2xl">
                {/* BACKGROUND */}

                <div className="absolute inset-0 bg-gradient-to-br from-[#e0e7ff]/70 via-[#f5f3ff]/50 to-[#ffffff]" />

                {/* AI AVATAR */}

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    <div className="absolute -inset-7 animate-pulse rounded-full bg-[#635bff]/10 blur-xl" />

                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full border border-[#e5e7eb] bg-gradient-to-br from-[#635bff] to-[#8b5cf6] shadow-2xl shadow-[#635bff]/30">
                      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f3f4f6] text-4xl">
                        ✦
                      </div>
                    </div>
                  </div>
                </div>

                {/* TOP LABEL */}

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 shadow-sm backdrop-blur">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-semibold">
                    AI Interviewer
                  </span>
                </div>

                {/* AI BADGE */}

                <div className="absolute right-4 top-4 flex items-center gap-2">
                  {isAISpeaking && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-[#635bff]/20 bg-white px-2.5 py-1.5 text-[9px] font-semibold text-[#635bff] shadow-sm">
                      <span className="flex items-end gap-0.5">
                        <span className="h-2 w-0.5 animate-pulse rounded-full bg-[#635bff]" />
                        <span className="h-3.5 w-0.5 animate-pulse rounded-full bg-[#8b5cf6]" />
                        <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-[#635bff]" />
                      </span>
                      AI Speaking
                    </div>
                  )}

                  <div className="rounded-lg bg-white px-2.5 py-1.5 text-[9px] font-semibold text-[#635bff] shadow-sm backdrop-blur">
                    AI
                  </div>
                </div>

                {/* QUESTION */}

                <div className="absolute bottom-4 left-4 right-4">
                  <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-lg backdrop-blur-xl">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#635bff]/10 text-[10px] text-[#635bff]">
                          ✦
                        </span>

                        <span className="text-[9px] font-semibold uppercase tracking-wider text-[#635bff]">
                          AI Interviewer asks
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          isAISpeaking
                            ? stopAISpeaking()
                            : speakQuestion()
                        }
                        disabled={loadingInterview || !getCurrentQuestionText()}
                        className={`rounded-lg border px-2.5 py-1.5 text-[9px] font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                          isAISpeaking
                            ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
                            : "border-[#e5e7eb] bg-white text-[#635bff] hover:bg-[#f8f7ff]"
                        }`}
                      >
                        {isAISpeaking ? "⏹ Stop" : "🔊 Listen"}
                      </button>
                    </div>

                    <p className="text-xs font-medium leading-5 text-[#111827]">
                      {getCurrentQuestionText() ||
                        "Loading your interview question..."}
                    </p>
                  </div>
                </div>
              </div>

              {/* CANDIDATE VIDEO */}

              <div className="relative aspect-video overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white shadow-sm">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className={`h-full w-full object-cover ${
                    cameraOn ? "" : "hidden"
                  }`}
                />

                {!cameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#f1f5f9] to-[#e0e7ff]">
                    <div className="text-center">
                      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#635bff] to-[#8b5cf6] text-2xl font-bold">
                        T
                      </div>

                      <p className="mt-3 text-xs font-semibold text-[#374151]">
                        Camera is off
                      </p>
                    </div>
                  </div>
                )}

                {/* LABEL */}

                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-3 py-2 shadow-sm backdrop-blur">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      micOn ? "bg-emerald-400" : "bg-red-400"
                    }`}
                  />

                  <span className="text-[10px] font-semibold text-[#111827]">You</span>
                </div>

                {/* SCREEN SHARE */}

                {screenSharing && (
                  <div className="absolute right-4 top-4 rounded-lg bg-[#635bff] px-3 py-1.5 text-[9px] font-bold">
                    Screen Sharing
                  </div>
                )}

                {/* SPEAKING */}

                {isAISpeaking && (
                  <div className="absolute bottom-4 left-4 flex items-center gap-2 rounded-xl border border-[#ddd8ff] bg-white px-3 py-2 shadow-sm">
                    <div className="flex h-4 items-end gap-0.5">
                      {[8, 13, 6, 15, 10].map((height, index) => (
                        <span
                          key={index}
                          className="w-1 animate-pulse rounded-full bg-[#635bff]"
                          style={{
                            height: `${height}px`,
                            animationDelay: `${index * 80}ms`,
                          }}
                        />
                      ))}
                    </div>

                    <span className="text-[9px] font-semibold text-[#635bff]">
                      AI is speaking...
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* =================================================
                CONTROLS
            ================================================== */}

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 rounded-2xl border border-[#e5e7eb] bg-white p-4">
              <button
                type="button"
                onClick={toggleMic}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                  micOn
                    ? "border-[#e5e7eb] bg-[#f3f4f6] text-[#111827] hover:bg-[#f3f4f6]"
                    : "border-red-500/30 bg-red-50 text-red-600"
                }`}
                title={micOn ? "Mute microphone" : "Unmute microphone"}
              >
                {micOn ? "🎙️" : "🔇"}
              </button>

              <button
                type="button"
                onClick={toggleCamera}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                  cameraOn
                    ? "border-[#e5e7eb] bg-[#f3f4f6] text-[#111827] hover:bg-[#f3f4f6]"
                    : "border-red-500/30 bg-red-50 text-red-600"
                }`}
                title={cameraOn ? "Stop video" : "Start video"}
              >
                {cameraOn ? "📷" : "🚫"}
              </button>

              <button
                type="button"
                onClick={toggleScreenShare}
                className={`flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition ${
                  screenSharing
                    ? "border-[#635bff]/40 bg-[#635bff]/15 text-[#b3aeff]"
                    : "border-[#e5e7eb] bg-[#f3f4f6] text-[#374151] hover:bg-[#f3f4f6]"
                }`}
              >
                🖥️
                <span className="hidden sm:inline">
                  {screenSharing ? "Stop Share" : "Share Screen"}
                </span>
              </button>

              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#e5e7eb] bg-[#f3f4f6] text-[#111827] transition hover:bg-[#f3f4f6]"
                title="Settings"
              >
                ⚙
              </button>

              <div className="hidden h-8 w-px bg-[#f3f4f6] sm:block" />

              <button
                type="button"
                onClick={() => setShowEndModal(true)}
                className="flex h-11 items-center justify-center rounded-xl border border-red-500/25 bg-red-50 px-4 text-xs font-semibold text-red-600 transition hover:bg-red-50"
              >
                End Interview
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs leading-5 text-red-600">
                {error}
              </div>
            )}

            {showEvaluation && evaluation && (
              <div className="mb-4 rounded-2xl border border-[#635bff]/20 bg-white p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#635bff]">
                      AI Evaluation
                    </p>
                    <h2 className="mt-1 text-base font-bold text-[#111827]">
                      Feedback on your answer
                    </h2>
                  </div>

                  {(evaluation?.score ?? evaluation?.rating) !== undefined && (
                    <div className="rounded-xl bg-[#635bff]/10 px-4 py-2 text-center">
                      <p className="text-[9px] uppercase text-[#9ca3af]">Score</p>
                      <p className="text-lg font-bold text-[#635bff]">
                        {evaluation?.score ?? evaluation?.rating}/100
                      </p>
                    </div>
                  )}
                </div>

                {(evaluation?.feedback ||
                  evaluation?.overallFeedback ||
                  evaluation?.comment) && (
                  <p className="mt-4 text-xs leading-6 text-[#374151]">
                    {evaluation?.feedback ??
                      evaluation?.overallFeedback ??
                      evaluation?.comment}
                  </p>
                )}

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(evaluation?.strengths || evaluation?.weaknesses) && (
                    <>
                      {Array.isArray(evaluation?.strengths) &&
                        evaluation.strengths.length > 0 && (
                          <div className="rounded-xl bg-emerald-50 p-3">
                            <p className="text-[10px] font-bold text-emerald-600">
                              Strengths
                            </p>
                            <ul className="mt-2 space-y-1 text-[10px] leading-5 text-[#6b7280]">
                              {evaluation.strengths.map(
                                (item: any, index: number) => (
                                  <li key={index}>• {String(item)}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}

                      {Array.isArray(evaluation?.weaknesses) &&
                        evaluation.weaknesses.length > 0 && (
                          <div className="rounded-xl bg-red-50 p-3">
                            <p className="text-[10px] font-bold text-red-600">
                              Improve
                            </p>
                            <ul className="mt-2 space-y-1 text-[10px] leading-5 text-[#6b7280]">
                              {evaluation.weaknesses.map(
                                (item: any, index: number) => (
                                  <li key={index}>• {String(item)}</li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                    </>
                  )}
                </div>

                <button
                  type="button"
                  onClick={moveToNextQuestion}
                  disabled={isCompleting}
                  className="mt-4 w-full rounded-xl bg-[#635bff] py-3 text-xs font-semibold text-white transition hover:bg-[#5046e5] disabled:opacity-50"
                >
                  {currentQuestion < questions.length
                    ? "Continue to Next Question →"
                    : isCompleting
                      ? "Completing Interview..."
                      : "Finish Interview →"}
                </button>
              </div>
            )}

            {/* =================================================
                ANSWER AREA
            ================================================== */}

            <div className="mt-4 rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#111827]">
                    Your Answer
                  </p>

                  <p className="mt-1 text-[10px] text-[#9ca3af]">
                    Speak naturally or type your answer below.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`rounded-xl px-3 py-2 text-[10px] font-semibold transition ${
                    isListening
                      ? "bg-red-50 text-red-600 ring-1 ring-red-200"
                      : "bg-[#635bff]/10 text-[#635bff] hover:bg-[#edeaff]"
                  }`}
                >
                  {isListening ? "⏹ Stop Listening" : "🎙️ Voice Answer"}
                </button>
              </div>

              <textarea
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
                placeholder="Type your answer here..."
                rows={4}
                className="w-full resize-none rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-xs leading-6 text-[#111827] outline-none transition placeholder:text-[#6b7280] focus:border-[#635bff]/50"
              />

              <div className="mt-3 flex items-center justify-between">
                <p className="text-[9px] text-[#6b7280]">
                  AI will evaluate your response after submission.
                </p>

                <button
                  type="button"
                  onClick={submitAnswer}
                  disabled={
                    isSubmitting ||
                    loadingInterview ||
                    !answer.trim() ||
                    Boolean(finalReport)
                  }
                  className="rounded-xl bg-[#635bff] px-5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#635bff]/20 transition hover:bg-[#5046e5] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Evaluating..." : "Submit Answer →"}
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              RIGHT SIDEBAR
          ================================================== */}

          <aside className="space-y-4">
            {/* INTERVIEW TOOLS */}

            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">
                    Interview Tools
                  </h2>

                  <p className="mt-1 text-[10px] text-[#9ca3af]">
                    Control your interview session
                  </p>
                </div>

                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#635bff]/10 text-[#635bff]">
                  ⚙
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={toggleMic}
                  className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fc] p-3 text-left transition hover:bg-[#f8f9fc]"
                >
                  <span className="text-sm">
                    {micOn ? "🎙️" : "🔇"}
                  </span>

                  <p className="mt-2 text-[10px] font-semibold text-[#374151]">
                    {micOn ? "Mute Mic" : "Unmute Mic"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fc] p-3 text-left transition hover:bg-[#f8f9fc]"
                >
                  <span className="text-sm">📷</span>

                  <p className="mt-2 text-[10px] font-semibold text-[#374151]">
                    {cameraOn ? "Stop Video" : "Start Video"}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={toggleScreenShare}
                  className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fc] p-3 text-left transition hover:bg-[#f8f9fc]"
                >
                  <span className="text-sm">🖥️</span>

                  <p className="mt-2 text-[10px] font-semibold text-[#374151]">
                    {screenSharing ? "Stop Share" : "Share Screen"}
                  </p>
                </button>

                <button
                  type="button"
                  className="rounded-xl border border-[#e5e7eb] bg-[#f8f9fc] p-3 text-left transition hover:bg-[#f8f9fc]"
                >
                  <span className="text-sm">⚙</span>

                  <p className="mt-2 text-[10px] font-semibold text-[#374151]">
                    Settings
                  </p>
                </button>
              </div>
            </div>

            {/* AI TIP */}

            <div className="rounded-2xl border border-[#635bff]/20 bg-gradient-to-br from-[#635bff]/15 to-[#8b5cf6]/5 p-5">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#635bff]/15 text-[#635bff]">
                  ✦
                </div>

                <div>
                  <p className="text-xs font-bold text-[#111827]">Pro Tip</p>

                  <p className="mt-2 text-[10px] leading-5 text-[#6b7280]">
                    Speak clearly, take your time and support your answers
                    with specific examples from your experience.
                  </p>
                </div>
              </div>
            </div>

            {/* LIVE TRANSCRIPT */}

            <div className="flex max-h-[470px] flex-col overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
              <div className="flex items-center justify-between border-b border-[#e5e7eb] p-5">
                <div>
                  <h2 className="text-sm font-bold text-[#111827]">
                    Live Transcript
                  </h2>

                  <p className="mt-1 text-[10px] text-[#9ca3af]">
                    Interview conversation
                  </p>
                </div>

                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-semibold text-emerald-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Listening
                </span>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-5">
                {transcript.map((item, index) => (
                  <div key={index}>
                    <div className="mb-1 flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold ${
                          item.speaker === "AI"
                            ? "text-[#635bff]"
                            : "text-emerald-600"
                        }`}
                      >
                        {item.speaker}
                      </span>

                      <span className="text-[9px] text-[#6b7280]">
                        {item.time}
                      </span>
                    </div>

                    <div
                      className={`rounded-xl p-3 text-[10px] leading-5 ${
                        item.speaker === "AI"
                          ? "bg-[#635bff]/10 text-[#374151]"
                          : "bg-[#f8f9fc] text-[#6b7280]"
                      }`}
                    >
                      {item.text}
                    </div>
                  </div>
                ))}

                {isListening && (
                  <div className="rounded-xl bg-[#635bff]/10 p-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-[#8b7cff]" />

                      <span className="text-[10px] text-[#635bff]">
                        Listening to your response...
                      </span>
                    </div>

                    <div className="mt-3 flex h-5 items-center justify-center gap-1">
                      {[7, 14, 9, 18, 12, 20, 8, 15, 10].map(
                        (height, index) => (
                          <span
                            key={index}
                            className="w-1 rounded-full bg-[#635bff]"
                            style={{ height: `${height}px` }}
                          />
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PROGRESS */}

            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[#9ca3af]">
                    Interview Progress
                  </p>

                  <p className="mt-1 text-lg font-bold text-[#111827]">
                    {currentQuestion}/10
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#635bff]/30 text-xs font-bold text-[#635bff]">
                  {Math.round((currentQuestion / (questions.length || 10)) * 100)}%
                </div>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#f3f4f6]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#635bff] to-[#8b5cf6]"
                  style={{
                    width: `${(currentQuestion / (questions.length || 10)) * 100}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex justify-between text-[9px] text-[#6b7280]">
                <span>Started</span>
                <span>In Progress</span>
                <span>Complete</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* =====================================================
          END INTERVIEW MODAL
      ====================================================== */}

      {finalReport && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center bg-white/90 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-2xl">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl text-emerald-600">
                ✓
              </div>

              <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#635bff]">
                Interview Complete
              </p>

              <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                Great job completing your interview!
              </h2>

              {(finalReport?.score ??
                finalReport?.overallScore ??
                finalReport?.finalScore) !== undefined && (
                <div className="mx-auto mt-5 w-fit rounded-2xl bg-[#635bff]/10 px-8 py-4">
                  <p className="text-[10px] uppercase tracking-wider text-[#9ca3af]">
                    Overall Score
                  </p>
                  <p className="mt-1 text-4xl font-bold text-[#635bff]">
                    {finalReport?.score ??
                      finalReport?.overallScore ??
                      finalReport?.finalScore}
                    %
                  </p>
                </div>
              )}
            </div>

            {(finalReport?.strengths || finalReport?.weaknesses) && (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {Array.isArray(finalReport?.strengths) &&
                  finalReport.strengths.length > 0 && (
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-bold text-emerald-600">
                        Strengths
                      </p>
                      <ul className="mt-3 space-y-2 text-[10px] leading-5 text-[#6b7280]">
                        {finalReport.strengths.map(
                          (item: any, index: number) => (
                            <li key={index}>• {String(item)}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {Array.isArray(finalReport?.weaknesses) &&
                  finalReport.weaknesses.length > 0 && (
                    <div className="rounded-2xl bg-red-50 p-4">
                      <p className="text-xs font-bold text-red-600">
                        Areas to Improve
                      </p>
                      <ul className="mt-3 space-y-2 text-[10px] leading-5 text-[#6b7280]">
                        {finalReport.weaknesses.map(
                          (item: any, index: number) => (
                            <li key={index}>• {String(item)}</li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </div>
            )}

            {(finalReport?.feedback ||
              finalReport?.summary ||
              finalReport?.overallFeedback) && (
              <div className="mt-4 rounded-2xl bg-[#f8f9fc] p-4">
                <p className="text-xs font-bold text-[#111827]">
                  AI Interview Summary
                </p>
                <p className="mt-2 text-[10px] leading-6 text-[#6b7280]">
                  {finalReport?.feedback ??
                    finalReport?.summary ??
                    finalReport?.overallFeedback}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => router.push("/interview")}
              className="mt-6 w-full rounded-xl bg-[#635bff] py-3 text-xs font-semibold text-white transition hover:bg-[#5046e5]"
            >
              Back to Interview Dashboard
            </button>
          </div>
        </div>
      )}

      {showEndModal && !finalReport && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/90 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              !
            </div>

            <h2 className="mt-5 text-xl font-bold text-[#111827]">
              End this interview?
            </h2>

            <p className="mt-2 text-xs leading-6 text-[#6b7280]">
              Your current interview session will be ended. Your answers and
              performance will be available for AI analysis after the session
              is completed.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="rounded-xl border border-[#e5e7eb] px-5 py-3 text-xs font-semibold text-[#374151] transition hover:bg-white/[0.05]"
              >
                Continue Interview
              </button>

              <button
                type="button"
                onClick={handleEndInterview}
                disabled={isCompleting}
                className="rounded-xl bg-red-500 px-5 py-3 text-xs font-semibold text-[#111827] transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompleting ? "Ending..." : "End Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}