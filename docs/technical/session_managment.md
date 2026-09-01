# Manejo stateless de las sesiones
Se utilizará JWT para el manejo de sesiones, a diferencia de web no se guardará en cookies ya que Expo cuenta con un plugin `expo-secure-store` con el que se puede acceder a un key value que el mismo dispositivo cifra.

```plaintext
Formulario login/register -> Servidor responde con el token
                                          |
                                          v
Manda token por headers   <-    Se guarda el secure store
```

Para acceder a guardar u obtener el token se hace uso del `SecureStore` con las funciones

```javascript
// Guardar cuando responde el servidor
SecureStore.setItemAsync('access_token', accessToken);
// Acceder al token para enviarlo en headers
SecureStore.getItemAsync('access_token');
// Elminar el token para un logout
SecureStore.deleteItemAsync('access_token');
```

El contenido del token será el subject (user_id) y el exp (fecha de expiración)