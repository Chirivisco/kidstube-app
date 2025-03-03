import React, { useState } from "react";
import "../css/LoginSignup.css";
import { useForm } from "react-hook-form";

export default function LoginSignup() {
  const [isSignUp, setIsSignUp] = useState(false);

  // Hook (estados) de formulario
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  // Alterna entre la pestaña de login y sign up
  const toggleForm = () => {
    setIsSignUp(!isSignUp);
  };

  // comprueba la edad
  const validateAge = (date) => {
    const birthDate = new Date(date);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (age > 18 || (age === 18 && (monthDiff > 0 || (monthDiff === 0 && dayDiff >= 0)))) {
      return true;
    }
    return "Mínimo de edad de 18 años";
  };

  // comprueba igualdad de contraseñas
  const validatePasswordMatch = (value) => {
    return value === watch("password") || "Las contraseñas no coinciden";
  };

  // Función para el envío de datos
  const onSubmit = (data) => {
    console.log("Formulario enviado:", data);
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

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="cont_text_inputs">
              {isSignUp && (
                <input
                  type="text"
                  className="input_form_sign d_block active_inp"
                  placeholder="NAME"
                  {...register("name", { required: "El nombre es obligatorio" })}
                />
              )}

              <input
                type="text"
                className="input_form_sign d_block active_inp"
                placeholder="EMAIL"
                {...register("email", {
                  required: "El email es obligatorio",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                    message: "Formato de email no válido",
                  },
                })}
              />
              {errors.email && <p className="error_message">{errors.email.message}</p>}

              <input
                type="password"
                className="input_form_sign d_block active_inp"
                placeholder="PASSWORD"
                {...register("password", { required: "La contraseña es obligatoria" })}
              />
              {errors.password && <p className="error_message">{errors.password.message}</p>}

              {isSignUp && (
                <>
                  <input
                    type="password"
                    className="input_form_sign d_block active_inp"
                    placeholder="CONFIRM PASSWORD"
                    {...register("confirmPassword", {
                      required: "Debes confirmar tu contraseña",
                      validate: validatePasswordMatch,
                    })}
                  />
                  {errors.confirmPassword && (
                    <p className="error_message">{errors.confirmPassword.message}</p>
                  )}
                </>
              )}

              {isSignUp && (
                <>
                  {/* Etiqueta para país */}
                  <label htmlFor="country" className="Select-country-lbl">Selecciona tu país:</label>
                  <select
                    id="country"
                    className="input_form_sign d_block active_inp"
                    {...register("country", { required: "Selecciona un país" })}
                  >
                    <option value="">Selecciona un país</option>
                    <option value="MX">México</option>
                    <option value="US">Estados Unidos</option>
                    <option value="ES">España</option>
                    <option value="AR">Argentina</option>
                    <option value="CO">Colombia</option>
                    <option value="CL">Chile</option>
                  </select>
                  {errors.country && <p className="error_message">{errors.country.message}</p>}

                  {/* Fecha de nacimiento */}
                  <input
                    type="date"
                    id="birthday-input"
                    className="input_form_sign d_block active_inp"
                    {...register("birthDate", {
                      required: "Debes ingresar tu fecha de nacimiento",
                      validate: validateAge,
                    })}
                  />
                  {errors.birthDate && <p className="error_message">{errors.birthDate.message}</p>}

                  {/* Número de teléfono */}
                  <input
                    type="tel"
                    className="input_form_sign d_block active_inp"
                    placeholder="TELÉFONO"
                    {...register("phone", {
                      required: "El número de teléfono es obligatorio",
                      pattern: {
                        value: /^[0-9]{10,15}$/,
                        message: "Debe contener entre 10 y 15 dígitos numéricos",
                      },
                    })}
                  />
                  {errors.phone && <p className="error_message">{errors.phone.message}</p>}

                  {/* PIN */}
                  <input
                    type="number"
                    className="input_form_sign d_block active_inp"
                    placeholder="PIN"
                    {...register("pin", {
                      required: "Ingrese un PIN",
                      minLength: {
                        value: 6,
                        message: "El PIN debe tener 6 dígitos",
                      },
                      maxLength: {
                        value: 6,
                        message: "El PIN debe tener 6 dígitos",
                      },
                    })}
                  />
                  {errors.pin && <p className="error_message">{errors.pin.message}</p>}

                  {/* Términos y condiciones */}
                  <div className="terms_and_cons d_block">
                    <p>
                      <input type="checkbox" {...register("terms", { required: true })} />{" "}
                      <label htmlFor="terms">Acepto los Términos y Condiciones.</label>
                    </p>
                    {errors.terms && <p className="error_message">Debes aceptar los términos</p>}
                  </div>
                </>
              )}
            </div>

            <div className="cont_btn">
              <button type="submit" className="btn_sign">
                {isSignUp ? "SIGN UP" : "SIGN IN"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
