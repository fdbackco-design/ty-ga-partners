import { TY_SYSTEM_HOST, TY_SYSTEM_INITIAL_PASSWORD, TY_SYSTEM_URL } from "@/lib/tySystem";

export default function SystemLoginGuide({
  username,
  plain = false,
}: {
  username: string;
  plain?: boolean;
}) {
  return (
    <section className={`system-login-guide${plain ? " is-plain" : ""}`} aria-labelledby="system-login-title">
      <h3 id="system-login-title" className="system-login-title">
        전산 로그인 안내
      </h3>
      <dl className="system-login-rows">
        <div>
          <dt>전산 주소</dt>
          <dd>{TY_SYSTEM_HOST}</dd>
        </div>
        <div>
          <dt>아이디</dt>
          <dd>{username}</dd>
        </div>
        <div>
          <dt>최초 비밀번호</dt>
          <dd>{TY_SYSTEM_INITIAL_PASSWORD}</dd>
        </div>
      </dl>
      <a className="system-login-go" href={TY_SYSTEM_URL} target="_blank" rel="noreferrer">
        전산 바로가기 →
      </a>
      <p className="system-login-note">
        <strong>최초 비밀번호는 {TY_SYSTEM_INITIAL_PASSWORD}입니다.</strong>
        최초 로그인 후 반드시 비밀번호를 변경해 주세요.
      </p>
    </section>
  );
}
