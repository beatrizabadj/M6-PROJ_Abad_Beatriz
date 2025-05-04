L'arquitectura comporta d'una jerarquia de 3 nivells de components:

    - App:
    
    És el component arrel que gestiona l'estat global del tema, els usuaris i el usuari seleccionat.
    Fa ús del context del tema per a tota la app amb ThemeContext
    
    Els seus components fills:

    - UserPanel:
        - Llista els usuaris
        - Afegeix, selecciona i deselecciona l'usuari
        - Mostra les estadístiques de les tasques de l'usuari seleccionat
        - Canvia el tema fent ús de ThemeContext

    - TaskPanel: 
        - Mostra la llista de tasques del usuari seleccionat
        - Gestiona l'afegiment, edició, eliminació i marcament de tasques com a completades

    Context ThemeContext:

        El creem amb createContext() i l'utilitzem per gestionar el tema. És accessible des de qualsevol component dins del Provider.

        theme és la variable que conté l'estat actual del tema
        togleTheme és la funció que fem servir per canviar d'un tema clar al fosc

        L'apliquem al body amb useEffect() i així canviem la classe CSS de 'light' a 'dark'