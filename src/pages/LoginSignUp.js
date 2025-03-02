import React, { useState } from "react";
import "../css/LoginSignup.css"; // Importamos los estilos

// Estados
// 'isSignUp: true' muestra el sign up
// 'isSignUp: false' muestra el sign in
// 'setIsSignUp' cambia el estado
export default function LoginSignup() {
  const [isSignUp, setIsSignUp] = useState(false);

  // evento para alternar estado
  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <div className="cont_principal">
      <div className={`cont_centrar ${isSignUp ? "cent_active" : ""}`}>
        <div className="cont_login">
          <div className="cont_tabs_login">
            <ul className="ul_tabs">
              <li className={!isSignUp ? "active" : ""}>
                <a href="#" onClick={() => setIsSignUp(false)}>
                  SIGN IN
                </a>
                <span className="linea_bajo_nom"></span>
              </li>
              <li className={isSignUp ? "active" : ""}>
                <a href="#" onClick={() => setIsSignUp(true)}>
                  SIGN UP
                </a>
                <span className="linea_bajo_nom"></span>
              </li>
            </ul>
          </div>

          <div className="cont_text_inputs">
            {isSignUp && (
              <input
                type="text"
                className="input_form_sign d_block active_inp"
                placeholder="NAME"
                name="name_us"
              />
            )}

            <input
              type="text"
              className="input_form_sign d_block active_inp"
              placeholder="EMAIL"
              name="email_us"
            />
            <input
              type="password"
              className="input_form_sign d_block active_inp"
              placeholder="PASSWORD"
              name="pass_us"
            />

            {isSignUp && (
              <input
                type="password"
                className="input_form_sign d_block active_inp"
                placeholder="CONFIRM PASSWORD"
                name="conf_pass_us"
              />
            )}
          </div>

          {isSignUp && (
              <input
                type="text"
                className="input_form_sign d_block active_inp"
                placeholder="PIN"
                name="pin_us"
              />
            )}

          {isSignUp && (
            <div className="terms_and_cons d_block">
              <p>
                <input type="checkbox" name="terms_and_cons" />{" "}
                <label htmlFor="terms_and_cons">
                  Accept Terms and Conditions.
                </label>
              </p>
            </div>
          )}

          <div className="cont_btn">
            <button className="btn_sign">
              {isSignUp ? "SIGN UP" : "SIGN IN"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
