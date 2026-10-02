import { TY_SYSTEM_AUTH_PATH, TY_SYSTEM_AUTH_URL } from "@/lib/tySystem";

export default function SystemLoginGuide({
  username,
  password,
  plain = false,
  featured = false,
  hideLoginDetails = false,
}: {
  username: string;
  password?: string;
  plain?: boolean;
  featured?: boolean;
  /** 메인 발급완료 등에서 제목·주소·아이디 중복 표시를 숨길 때 */
  hideLoginDetails?: boolean;
}) {
  const classes = [
    "system-login-guide",
    plain ? "is-plain" : "",
    featured ? "is-featured" : "",
    hideLoginDetails ? "is-compact" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const titleId = "system-login-title";

  return (
    <section
      className={classes}
      aria-labelledby={hideLoginDetails ? undefined : titleId}
      aria-label={hideLoginDetails ? "전산 로그인 안내" : undefined}
    >
      {!hideLoginDetails ? (
        <h3 id={titleId} className="system-login-title">
          전산 로그인 안내
        </h3>
      ) : null}
      {hideLoginDetails && !password ? null : (
        <dl className="system-login-rows">
          {!hideLoginDetails ? (
            <>
              <div>
                <dt>전산 주소</dt>
                <dd>{TY_SYSTEM_AUTH_PATH}</dd>
              </div>
              <div>
                <dt>전산 아이디</dt>
                <dd>{username || "-"}</dd>
              </div>
            </>
          ) : null}
          {password ? (
            <div>
              <dt>전산 비밀번호</dt>
              <dd className="system-login-secret">{password}</dd>
            </div>
          ) : null}
        </dl>
      )}
      <p className="system-login-note">
        {password ? (
          <>
            처음 로그인 후 비밀번호를 바꿔 두는 것을 권장합니다.
          </>
        ) : (
          <>
            <strong>전산 아이디는 신청 시 직접 정한 아이디입니다.</strong>
            비밀번호도 그때 정한 값으로 로그인해 주세요.
          </>
        )}
      </p>
      <a
        className={featured ? "btn-apply system-login-go-featured" : "system-login-go"}
        href={TY_SYSTEM_AUTH_URL}
        target="_blank"
        rel="noreferrer"
      >
        전산 바로가기 →
      </a>
    </section>
  );
}
