import {
  CreateUserReq,
  CreateUserRes,
  CreateUserSchema,
  ApiError,
} from "@mindlog/types";

import { useState } from "react";
import axios from "axios";

import { API_URL } from "@/constants/Environment";

import { Box } from "@/components/ui/box";
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";

import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";
import {
  Toast,
  ToastDescription,
  ToastTitle,
} from "@/components/ui/toast";

import { ArrowRight } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FormField = keyof CreateUserReq;

type FormErrors = Partial<Record<FormField, string>>;

const INITIAL_FORM: CreateUserReq = {
  username: "",
  email: "",
  password: "",
};

export default function Register() {
  const [userForm, setUserForm] =
    useState<CreateUserReq>(INITIAL_FORM);

  const [loading, setLoading] = useState(false);

  const [fieldErrors, setFieldErrors] =
    useState<FormErrors>({});

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const handleChange = (
    field: FormField,
    value: string,
  ) => {
    setUserForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar únicamente el error del campo modificado.
    setFieldErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));

    setSubmitError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setFieldErrors({});
    setSubmitError(null);

    // 1. Validar únicamente al presionar el botón.
    const result = await CreateUserSchema.safeParseAsync(
      userForm,
    );

    if (!result.success) {
      const errors: FormErrors = {};

      // 2. Asociar cada error con su campo correspondiente.
      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if (
          typeof field === "string" &&
          field in INITIAL_FORM &&
          !errors[field as FormField]
        ) {
          errors[field as FormField] = issue.message;
        }
      }

      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    // 3. Enviar los datos validados a la API.
    try {
      const response = await axios.post<CreateUserRes>(
        `${API_URL}/auth/register`,
        result.data,
      );

      console.log(response.data);
    } catch (error: unknown) {
      if (axios.isAxiosError<ApiError>(error)) {
        const apiError = error.response?.data;

        if (apiError) {
          // Errores específicos devueltos por el backend.
          const errors: FormErrors = {};

          for (const detail of apiError.details ?? []) {
            const field = detail.field;

            if (
              field &&
              field in INITIAL_FORM &&
              detail.message
            ) {
              errors[field as FormField] = detail.message;
            }
          }

          setFieldErrors(errors);

          // Mostrar un mensaje general si existe.
          setSubmitError(
            apiError.message ||
            "No se pudo completar el registro",
          );
        } else {
          setSubmitError(
            error.message ||
            "No se pudo conectar con el servidor",
          );
        }
      } else {
        setSubmitError(
          error instanceof Error
            ? error.message
            : "No se pudo completar el registro",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="w-full h-full">
      <Center className="p-5 gap-10">
        <Box className="w-full gap-3">
          <Text className="font-bold text-4xl">
            Bienvenido
          </Text>

          <Text className="text-muted-foreground text-lg">
            Regístrate y organiza tus proyectos
          </Text>
        </Box>

        <Box className="w-full gap-5">
          {/* Username */}
          <FormControl
            isInvalid={Boolean(fieldErrors.username)}
            isRequired
          >
            <FormControlLabel>
              <FormControlLabelText className="text-lg">
                Nombre de usuario
              </FormControlLabelText>
            </FormControlLabel>

            <Input isInvalid={Boolean(fieldErrors.username)}>
              <InputField
                value={userForm.username}
                onChangeText={(text) =>
                  handleChange("username", text)
                }
                className="text-lg"
                placeholder="Refri"
                autoCapitalize="none"
                editable={!loading}
              />
            </Input>

            {fieldErrors.username && (
              <FormControlError>
                <FormControlErrorText>
                  {fieldErrors.username}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Email */}
          <FormControl
            isInvalid={Boolean(fieldErrors.email)}
            isRequired
          >
            <FormControlLabel>
              <FormControlLabelText className="text-lg">
                Correo electrónico
              </FormControlLabelText>
            </FormControlLabel>

            <Input isInvalid={Boolean(fieldErrors.email)}>
              <InputField
                value={userForm.email}
                onChangeText={(text) =>
                  handleChange("email", text)
                }
                className="text-lg"
                placeholder="refri@mindlog.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </Input>

            {fieldErrors.email && (
              <FormControlError>
                <FormControlErrorText>
                  {fieldErrors.email}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>

          {/* Password */}
          <FormControl
            isInvalid={Boolean(fieldErrors.password)}
            isRequired
          >
            <FormControlLabel>
              <FormControlLabelText className="text-lg">
                Contraseña
              </FormControlLabelText>
            </FormControlLabel>

            <Input
              isInvalid={Boolean(fieldErrors.password)}
            >
              <InputField
                value={userForm.password}
                onChangeText={(text) =>
                  handleChange("password", text)
                }
                className="text-lg"
                type="password"
                placeholder="increible123"
                autoCapitalize="none"
                editable={!loading}
              />
            </Input>

            {fieldErrors.password && (
              <FormControlError>
                <FormControlErrorText>
                  {fieldErrors.password}
                </FormControlErrorText>
              </FormControlError>
            )}
          </FormControl>
        </Box>

        <Button
          isDisabled={loading}
          onPress={handleSubmit}
          className="w-full max-w-full"
        >
          <ButtonText className="text-lg">
            {loading ? "Registrando..." : "Registrarse"}
          </ButtonText>

          <ButtonIcon as={ArrowRight} />
        </Button>

        {submitError && (
          <Toast action="error" variant="solid" className="w-full">
            <ToastTitle>Error</ToastTitle>
            <ToastDescription>{submitError}</ToastDescription>
          </Toast>
        )}
      </Center>
    </SafeAreaView>
  );
}