
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  BoardFilter,
  BoardRes,
  CreateBoardSchema,
  UpdateBoardSchema,
} from "@mindlog/types";
import { API_URL } from "@/constants/Environment";
import { useAuth } from "@/context/AuthContext";

import { Box } from "@/components/ui/box";
import { Card } from "@/components/ui/card";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import {
  Button,
  ButtonIcon,
  ButtonText,
} from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectItem,
} from "@/components/ui/select";
import {
  Menu,
  MenuItem,
  MenuItemLabel,
} from "@/components/ui/menu";
import {
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@/components/ui/modal";
import {
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
} from "@/components/ui/form-control";
import { Input, InputField } from "@/components/ui/input";
import {
  Textarea,
  TextareaInput,
} from "@/components/ui/textarea";

import {
  PackageOpen,
  Plus,
  Menu as MenuIcon,
  ListFilter,
  Pencil,
  Trash2,
  LogOut,
  X,
} from "lucide-react-native";

type BoardModalState =
  | { mode: "create" }
  | { mode: "edit"; board: BoardRes }
  | { mode: "delete"; board: BoardRes }
  | { mode: "leave"; board: BoardRes }
  | null;

type BoardFormErrors = {
  title?: string;
  description?: string;
};

export default function Home() {
  const auth = useAuth();

  const [showBoards, setShowBoards] = useState<BoardFilter>("all");
  const [boards, setBoards] = useState<BoardRes[]>([]);
  const [modal, setModal] = useState<BoardModalState>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formErrors, setFormErrors] = useState<BoardFormErrors>({});

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Evita que una petición antigua sobrescriba una más reciente.
  const requestId = useRef(0);

  const notFoundText = (filter: BoardFilter): string => {
    if (filter === "all") {
      return "Aún no tienes ni perteneces a un tablero";
    }

    if (filter === "owned") {
      return "Aún no tienes ningún tablero propio";
    }

    return "Aún no te han añadido a un tablero";
  };

  const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
      return (
        error.response?.data?.message ??
        "No se pudo completar la operación. Inténtalo nuevamente."
      );
    }

    return "Ocurrió un error inesperado.";
  };

  const getBoards = useCallback(async () => {
    const currentRequestId = ++requestId.current;

    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await axios.get<BoardRes[]>(
        `${API_URL}/boards`,
        {
          params: { filter: showBoards },
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        },
      );

      if (currentRequestId === requestId.current) {
        setBoards(response.data);
      }
    } catch (error: unknown) {
      if (currentRequestId === requestId.current) {
        setLoadError(getErrorMessage(error));
      }
    } finally {
      if (currentRequestId === requestId.current) {
        setIsLoading(false);
      }
    }
  }, [auth.token, showBoards]);

  useEffect(() => {
    void getBoards();

    return () => {
      // Invalida las respuestas pendientes al cambiar el filtro
      // o desmontar la pantalla.
      requestId.current++;
    };
  }, [getBoards]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setFormErrors({});
    setActionError(null);
  };

  const openCreateModal = () => {
    resetForm();
    setModal({ mode: "create" });
  };

  const handleBoardAction = (
    action: "edit" | "delete" | "leave",
    board: BoardRes,
  ) => {
    setActionError(null);

    if (action === "edit") {
      setTitle(board.title);
      setDescription(board.description ?? "");
      setFormErrors({});
      setModal({ mode: "edit", board });
      return;
    }

    setModal({ mode: action, board });
  };

  const closeModal = () => {
    if (isSaving || isDeleting) return;

    setModal(null);
    resetForm();
  };

  const handleSaveBoard = async () => {
    if (!modal || (modal.mode !== "create" && modal.mode !== "edit")) {
      return;
    }

    setFormErrors({});
    setActionError(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
    };

    // Validación exclusivamente al pulsar Guardar.
    const schema =
      modal.mode === "create"
        ? CreateBoardSchema
        : UpdateBoardSchema;

    const result = schema.safeParse(payload);

    if (!result.success) {
      const errors: BoardFormErrors = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0];

        if (
          (field === "title" || field === "description") &&
          !errors[field]
        ) {
          errors[field] = issue.message;
        }
      }

      setFormErrors(errors);
      return;
    }

    setIsSaving(true);

    try {
      if (modal.mode === "create") {
        await axios.post(
          `${API_URL}/boards`,
          result.data,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          },
        );
      } else {
        await axios.put(
          `${API_URL}/boards/${modal.board.boardId}`,
          result.data,
          {
            headers: {
              Authorization: `Bearer ${auth.token}`,
            },
          },
        );
      }

      setModal(null);
      resetForm();

      // Recarga usando el filtro que esté seleccionado.
      await getBoards();
    } catch (error: unknown) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBoard = async () => {
    if (!modal || modal.mode !== "delete") return;

    setIsDeleting(true);
    setActionError(null);

    try {
      await axios.delete(
        `${API_URL}/boards/${modal.board.boardId}`,
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        },
      );

      setModal(null);
      resetForm();

      await getBoards();
    } catch (error: unknown) {
      setActionError(getErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const isFormModal =
    modal?.mode === "create" || modal?.mode === "edit";

  return (
    <Box className="h-full w-full gap-6 bg-background p-5">
      {/* Cabecera y filtros */}
      <Box className="flex-row items-center justify-between gap-3">
        <Button onPress={openCreateModal}>
          <ButtonIcon as={Plus} />
          <ButtonText className="text-lg text-primary-foreground">
            Tablero
          </ButtonText>
        </Button>

        <Select
          selectedValue={showBoards}
          onValueChange={(value) => {
            setShowBoards(value as BoardFilter);
          }}
        >
          <SelectTrigger variant="outline" size="md" className="px-3">
            <SelectInput placeholder="Mostrar" />
            <SelectIcon as={ListFilter} />
          </SelectTrigger>

          <SelectPortal>
            <SelectBackdrop />
            <SelectContent>
              <SelectDragIndicatorWrapper>
                <SelectDragIndicator />
              </SelectDragIndicatorWrapper>

              <SelectItem label="Todos" value="all" />
              <SelectItem label="Mis tableros" value="owned" />
              <SelectItem label="Compartidos" value="shared" />
            </SelectContent>
          </SelectPortal>
        </Select>
      </Box>

      {/* Lista de tableros */}
      <Box className="flex-1 gap-3">
        {isLoading ? (
          <Center className="flex-1 gap-3">
            <Text>Cargando tableros...</Text>
          </Center>
        ) : loadError ? (
          <Center className="flex-1 gap-4 p-5">
            <Text className="text-center">{loadError}</Text>
            <Button variant="outline" onPress={() => void getBoards()}>
              <ButtonText>Reintentar</ButtonText>
            </Button>
          </Center>
        ) : boards.length === 0 ? (
          <Center className="flex-1 gap-5 p-5">
            <Icon className="h-15 w-15" as={PackageOpen} />
            <Text className="text-center text-lg">
              {notFoundText(showBoards)}
            </Text>
            <Button onPress={openCreateModal}>
              <ButtonIcon as={Plus} />
              <ButtonText>Crear tablero</ButtonText>
            </Button>
          </Center>
        ) : (
          boards.map((board) => (
            <Card
              key={board.boardId}
              className="flex-row items-center justify-between gap-4"
            >
              <Box className="flex-1 gap-1">
                <Text className="text-lg font-bold">
                  {board.title}
                </Text>

                {!!board.description && (
                  <Text className="text-typography-500">
                    {board.description}
                  </Text>
                )}
              </Box>

              <Menu
                placement="bottom right"
                offset={5}
                trigger={(triggerProps) => (
                  <Button
                    variant="ghost"
                    {...triggerProps}
                  >
                    <ButtonIcon as={MenuIcon} />
                  </Button>
                )}
              >
                {board.isOwner ? (
                  <>
                    <MenuItem
                      key="edit"
                      textValue="Editar"
                      onPress={() => handleBoardAction("edit", board)}
                    >
                      <Icon as={Pencil} size="md" className="mr-2" />
                      <MenuItemLabel>Editar</MenuItemLabel>
                    </MenuItem>

                    <MenuItem
                      key="delete"
                      textValue="Eliminar"
                      onPress={() => handleBoardAction("delete", board)}
                    >
                      <Icon as={Trash2} size="md" className="mr-2" />
                      <MenuItemLabel>Eliminar</MenuItemLabel>
                    </MenuItem>
                  </>
                ) : (
                  <MenuItem
                    key="leave"
                    textValue="Abandonar tablero"
                    onPress={() => handleBoardAction("leave", board)}
                  >
                    <Icon as={LogOut} size="md" className="mr-2" />
                    <MenuItemLabel>
                      Abandonar tablero
                    </MenuItemLabel>
                  </MenuItem>
                )}
              </Menu>
            </Card>
          ))
        )}
      </Box>

      {/* Modal reutilizable para crear, editar, eliminar y abandonar */}
      <Modal
        isOpen={modal !== null}
        onClose={closeModal}
        size="lg"
      >
        <ModalBackdrop />

        <ModalContent>
          <ModalHeader>
            <Text className="flex-1 text-lg font-bold">
              {modal?.mode === "create" && "Crear tablero"}
              {modal?.mode === "edit" && "Editar tablero"}
              {modal?.mode === "delete" && "Eliminar tablero"}
              {modal?.mode === "leave" && "Abandonar tablero"}
            </Text>

            <ModalCloseButton>
              <Icon as={X} />
            </ModalCloseButton>
          </ModalHeader>

          <ModalBody>
            {isFormModal ? (
              <Box className="gap-5">
                <FormControl isInvalid={!!formErrors.title}>
                  <FormControlLabel>
                    <FormControlLabelText>
                      Título
                    </FormControlLabelText>
                  </FormControlLabel>

                  <Input>
                    <InputField
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Nombre del tablero"
                      maxLength={200}
                      editable={!isSaving}
                    />
                  </Input>

                  {formErrors.title && (
                    <FormControlError>
                      <FormControlErrorText>
                        {formErrors.title}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>

                <FormControl isInvalid={!!formErrors.description}>
                  <FormControlLabel>
                    <FormControlLabelText>
                      Descripción (opcional)
                    </FormControlLabelText>
                  </FormControlLabel>

                  <Textarea>
                    <TextareaInput
                      value={description}
                      onChangeText={setDescription}
                      placeholder="¿De qué trata este tablero?"
                      maxLength={1000}
                      editable={!isSaving}
                    />
                  </Textarea>

                  {formErrors.description && (
                    <FormControlError>
                      <FormControlErrorText>
                        {formErrors.description}
                      </FormControlErrorText>
                    </FormControlError>
                  )}
                </FormControl>
              </Box>
            ) : modal?.mode === "delete" ? (
              <Text>
                ¿Estás seguro de que deseas eliminar el tablero
                {" "}
                <Text className="font-bold">
                  {modal.board.title}
                </Text>
                ? Esta acción no se puede deshacer.
              </Text>
            ) : modal?.mode === "leave" ? (
              <Text>
                La función para abandonar tableros compartidos
                todavía no está disponible.
              </Text>
            ) : null}

            {actionError && (
              <Text className="mt-3 text-error-600">
                {actionError}
              </Text>
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              variant="outline"
              action="secondary"
              onPress={closeModal}
              isDisabled={isSaving || isDeleting}
            >
              <ButtonText>Cancelar</ButtonText>
            </Button>

            {isFormModal && (
              <Button
                onPress={() => void handleSaveBoard()}
                isDisabled={isSaving}
              >
                <ButtonText>
                  {isSaving
                    ? "Guardando..."
                    : modal?.mode === "create"
                      ? "Crear"
                      : "Guardar cambios"}
                </ButtonText>
              </Button>
            )}

            {modal?.mode === "delete" && (
              <Button
                action="negative"
                onPress={() => void handleDeleteBoard()}
                isDisabled={isDeleting}
              >
                <ButtonText>
                  {isDeleting ? "Eliminando..." : "Eliminar"}
                </ButtonText>
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
