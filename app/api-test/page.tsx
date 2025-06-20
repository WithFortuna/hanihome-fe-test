"use client";

import { useState } from "react";

// API 기본 URL 설정
const API_BASE_URL = "https://hanihome-vote.shop";

const apiFetch = (input: RequestInfo, init: RequestInit = {}) => {
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  const headers = {
    ...(init.headers || {}),
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };
  return fetch(input, { ...init, headers, credentials: "include" });
};

interface LoginForm {
  username: string;
  password: string;
}

interface SignupForm {
  username: string;
  password: string;
  name: string;
  email: string;
}

interface Member {
  id: number;
  username: string;
  name: string;
  // 필요한 다른 필드들 추가 가능
}

export default function ApiTestPage() {
  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [signupForm, setSignupForm] = useState<SignupForm>({
    username: "",
    password: "",
    name: "",
    email: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [healthStatus, setHealthStatus] = useState<string>("");

  const handleHealthCheck = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setHealthStatus("서버 정상");
        setMessage("헬스체크 성공!");
        console.log("Health check response:", data);
      } else {
        setHealthStatus("서버 오류");
        const errorData = await response.json();
        setMessage(`헬스체크 실패: ${errorData.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      setHealthStatus("서버 연결 실패");
      setMessage(
        `헬스체크 오류: ${
          error instanceof Error ? error.message : "네트워크 오류"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupForm),
      });

      if (response.ok) {
        // 응답 본문이 있는지 확인
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setMessage("회원가입 성공!");
          console.log("Signup response:", data);
        } else {
          setMessage("회원가입 성공!");
          console.log("Signup response status:", response.status);
        }
        // 회원가입 성공 후 폼 초기화
        setSignupForm({ username: "", password: "", name: "", email: "" });
      } else {
        const errorData = await response.json();
        setMessage(`회원가입 실패: ${errorData.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      setMessage(
        `회원가입 오류: ${
          error instanceof Error ? error.message : "네트워크 오류"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginForm),
        credentials: "include", // 쿠키 포함
      });

      if (response.ok) {
        // 응답 본문이 있는지 확인
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          setMessage("로그인 성공!");
          console.log("Login response:", data);
        } else {
          setMessage("로그인 성공!");
          console.log("Login response status:", response.status);
        }
        setIsLoggedIn(true);
        const accessToken = response.headers
          .get("Authorization")
          ?.replace("Bearer ", "");
        if (accessToken) localStorage.setItem("accessToken", accessToken);
      } else {
        const errorData = await response.json();
        setMessage(`로그인 실패: ${errorData.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      setMessage(
        `로그인 오류: ${
          error instanceof Error ? error.message : "네트워크 오류"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await apiFetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsLoggedIn(false);
        setMembers([]);
        setMessage("로그아웃 성공!");
      } else {
        const errorData = await response.json();
        setMessage(`로그아웃 실패: ${errorData.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      setMessage(
        `로그아웃 오류: ${
          error instanceof Error ? error.message : "네트워크 오류"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGetMembers = async () => {
    setLoading(true);
    setMessage("");

    try {
      const response = await apiFetch(`${API_BASE_URL}/api/v1/members`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data);
        setMessage("회원 조회 성공!");
        console.log("Members response:", data);
      } else {
        const errorData = await response.json();
        setMessage(`회원 조회 실패: ${errorData.message || "알 수 없는 오류"}`);
      }
    } catch (error) {
      setMessage(
        `회원 조회 오류: ${
          error instanceof Error ? error.message : "네트워크 오류"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // 쿠키 생성 요청 (서버에서 쿠키를 내려줌)
  const handleCreateCookie = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/v1/cookie/create`, {
        method: "GET",
      });
      if (response.ok) {
        setMessage("쿠키 생성(서버에서 내려줌) 요청 성공!");
      } else {
        setMessage("쿠키 생성 요청 실패");
      }
    } catch (error) {
      setMessage(
        `쿠키 생성 요청 오류: ${
          error instanceof Error ? error.message : "네트워크 오류"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  // 쿠키 입력 요청 (클라이언트가 쿠키를 서버로 보냄)
  const handleInputCookie = async () => {
    setLoading(true);
    setMessage("");
    try {
      const response = await apiFetch(`${API_BASE_URL}/api/v1/cookie/input`, {
        method: "GET",
      });
      if (response.ok) {
        setMessage("쿠키 입력(클라이언트가 서버로 쿠키 보냄) 요청 성공!");
      } else {
        setMessage("쿠키 입력 요청 실패");
      }
    } catch (error) {
      setMessage(
        `쿠키 입력 요청 오류: ${
          error instanceof Error ? error.message : "네트워크 오류"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          백엔드 API 테스트 페이지
        </h1>

        {/* 메시지 표시 */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.includes("성공")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}

        {/* 헬스체크 섹션 */}
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            서버 상태 확인
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={handleHealthCheck}
              disabled={loading}
              className="bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "확인 중..." : "헬스체크"}
            </button>
            {healthStatus && (
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  healthStatus === "서버 정상"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {healthStatus}
              </div>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 회원가입 폼 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              회원가입
            </h2>
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이름
                </label>
                <input
                  type="text"
                  id="signup-name"
                  value={signupForm.name}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="signup-username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  사용자명
                </label>
                <input
                  type="text"
                  id="signup-username"
                  value={signupForm.username}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="signup-password"
                  value={signupForm.password}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  이메일
                </label>
                <input
                  type="email"
                  id="signup-email"
                  value={signupForm.email}
                  onChange={(e) =>
                    setSignupForm({ ...signupForm, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "가입 중..." : "회원가입"}
              </button>
            </form>
          </div>

          {/* 로그인 폼 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">로그인</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  사용자명
                </label>
                <input
                  type="text"
                  id="username"
                  value={loginForm.username}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, username: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  비밀번호
                </label>
                <input
                  type="password"
                  id="password"
                  value={loginForm.password}
                  onChange={(e) =>
                    setLoginForm({ ...loginForm, password: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>
          </div>

          {/* API 액션 버튼들 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              API 액션
            </h2>
            <div className="space-y-4">
              <button
                onClick={handleLogout}
                disabled={loading || !isLoggedIn}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "처리 중..." : "로그아웃"}
              </button>

              <button
                onClick={handleGetMembers}
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "조회 중..." : "회원 조회"}
              </button>

              {/* Authorization 헤더 초기화 버튼 */}
              <button
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  setMessage(
                    "Authorization 헤더(accessToken)가 초기화되었습니다."
                  );
                }}
                className="w-full bg-gray-400 text-white py-2 px-4 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Authorization 헤더 초기화
              </button>

              {/* API 액션 버튼들 */}
              <button
                onClick={handleCreateCookie}
                disabled={loading}
                className="w-full bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                쿠키 생성 (서버에서 내려줌)
              </button>
              <button
                onClick={handleInputCookie}
                disabled={loading}
                className="w-full bg-yellow-700 text-white py-2 px-4 rounded-md hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                쿠키 입력 (서버로 보냄)
              </button>
            </div>

            {/* 로그인 상태 표시 */}
            <div className="mt-4 p-3 bg-gray-100 rounded-md">
              <p className="text-sm text-gray-700">
                로그인 상태:
                <span
                  className={`ml-2 font-medium ${
                    isLoggedIn ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isLoggedIn ? "로그인됨" : "로그아웃됨"}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 회원 목록 */}
        {members.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              회원 목록 ({members.length}명)
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      사용자명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      이름
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.username}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {member.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* API 엔드포인트 정보 */}
        <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold mb-3 text-blue-900">
            API 엔드포인트 정보
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p>
                <strong>헬스체크:</strong> GET {API_BASE_URL}/health
              </p>
              <p>
                <strong>회원가입:</strong> POST {API_BASE_URL}
                /api/v1/auth/signup
              </p>
              <p>
                <strong>로그인:</strong> POST {API_BASE_URL}/api/v1/auth/signin
              </p>
            </div>
            <div>
              <p>
                <strong>로그아웃:</strong> POST {API_BASE_URL}
                /api/v1/auth/logout
              </p>
              <p>
                <strong>회원조회:</strong> GET {API_BASE_URL}/api/v1/members
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
