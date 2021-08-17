# Mi guía para usar mapas de leaflet en React con buscador y marcador al hacer clic. (Spanish-English)

*Advertencia: Mucho texto xd.*

Decidí crear esta guía dado que es confuso añadir el buscador y el marcador en el mapa de leaflet en react.
La versión de la librería de leaflet de react cambio y la forma en que lo muestra la documentación de las librerías
del buscador y del marcador no funciona.

Durante la implementación al no funcionar, me vi obligado a buscar en la web, con las soluciones encontradas 
realize la implementación para completar el requerimiento. Ahora lo resumo en este ejemplo y enlisto 
los pasos para que quién esté en la misma situación pueda implementarlo más fácilmente. 

Espero esta simple guía sea de ayuda a quién esté tratando de implementar lo mismo o algo parecido.
Así mismo, si tienes alguna idea para mejorar la implementación, añadir una funcionalidad o incluso mejorar la guía, 
corregir gramática tanto en su versión en español e inglés, no dudes en realizar el Pull request.

## Comprame un café xd
Si consideras que el presente ejemplo te sirvió, y quieres y tienes la posibilidad de apoyarme, 
no dudes en comprarme un café: https://www.buymeacoffee.com/FelipeGH 

## Español

## <a href="https://feliipegh.github.io/ReactLeafletSearchAndMarker/" target='_blank” rel=”noreferrer noopener'>Demo</a>

## Sección: Agregando Mapa

Para que leaflet funcione en react debes realizar primeramente lo siguiente:

Obtenido de la respuesta del usuario jlahd en: https://github.com/PaulLeCam/react-leaflet/issues/881

1.- Incluir react-leaflet en la transpilación de babel, procesando correctamente los operadores *??*.

	npm add -D react-app-rewired react-app-rewire-babel-loader

	package json
	  "scripts": {
	    "start": "react-app-rewired start",
	    "build": "react-app-rewired build",
	    "test": "react-app-rewired test",
	    "eject": "react-scripts eject"
	}

2.- Entra al ejemplo, copia y pega el archivo **config-overrides.js** a la raíz de tu proyecto. 

3.- Instalar leaflet: https://react-leaflet.js.org/docs/start-installation/

	npm install react react-dom leaflet

	npm install react-leaflet

### Nota

Debes importar los estilos css de leaflet y darle un alto y ancho al mapa, de otra manera no se mostrará.

    import "leaflet/dist/leaflet.css";

    <MapContainer style={{height: "38rem", width:"100%"}} >...

4.- Importa lo siguiente:

    import {MapConsumer, MapContainer, TileLayer, useMap} from 'react-leaflet';

5.- Agregar mapa a tu componente como lo muestra la documentación: https://react-leaflet.js.org/docs/start-setup/
Una vez agregado ya tendremos el mapa funcional, aún sin cuadro de búsqueda y selector de ubicación.

Puedes cambiar las coordenadas para poner las de tu preferencia en el atributo Center del componente MapContainer.

## Sección: Agregando buscador

1.- Para poder utilizar el buscador, vamos a utilizar las siguientes librerías:

	https://libraries.io/npm/leaflet-geosearch
	npm install leaflet-geosearch@3.5.0

	https://www.npmjs.com/package/leaflet-control-geocoder
	npm i leaflet-control-geocoder

2.- Hacer los imports de las librerías instaladas en el paso anterior y de L

	import L from "leaflet";
	import LCG from 'leaflet-control-geocoder';
	import {GeoSearchControl, OpenStreetMapProvider} from "leaflet-geosearch";

3.- importar el css del buscador:

    import "leaflet-geosearch/dist/geosearch.css";

4.- En los hijos del MapContainer solo dejar "TileLayer"

5.- Crear la siguiente función para cargar el buscador:

	function LeafletGeoSearch() {
	    const map = useMap();
	    const provider = new OpenStreetMapProvider();
	    const searchControl = new GeoSearchControl({
	        provider,
	        showMarker: false,
	        searchLabel: "Buscar dirección",
	        style: "bar"
	    });
	    useEffect(() => {
	        map.addControl(searchControl);
	        return () => map.removeControl(searchControl);
	    });
	    return null;
	}

6.- Agregar la función como hijo de MapContainer:

	<LeafletGeoSearch/>

Con la función agregada ya tendremos el buscador completamente funcional, para más información consultar su respectiva
documentación. Enlaces adjuntados en el paso 1 de esta sección.

## Sección: Agregando el marcador al hacer clic en alguna zona del mapa.

### Nota

En esta sección se va a mover el contenido de MapContainer a una función, utilizando el hook useMemo, La razón es que al
querer guardar los datos en una variable de estado (useState) el componente se renderizará y la librería realizará una
nueva petición en cada selección, tantas que leaflet nos bloqueará por tantas peticiones.

1.- Asegúrate de tener todos los imports del paso anterior.

2.- Agrega el archivo con el nombre "constants" del proyecto ejemplo e y realiza su importación, con el nombre icon.

    import icon from "./constants";

3.- Agrega la siguiente función:

	function OnEventClick(map, onMarked) {
	    const marker = useRef(null);

	    const onInit = () => {
	        LCG.L = L;
	        const geocoder = LCG.L.Control.Geocoder.nominatim();
	        map.on("click", function (e) {
	            const {lat, lng} = e.latlng;
	            if (marker.current !== null) {
	                map.removeLayer(marker.current);
	            }
	            marker.current = L.marker([lat, lng], {icon}).addTo(map);
	            geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), results => {
	                let r = results[0];
	                if (r) {
	                    marker.current.bindPopup(r?.name).openPopup();
	                    onMarked(r);
	                }
	            });
	        });
	    };

	    useEffect(onInit, [map, onMarked]);
	    return null;
	}

4.- Crea la variable de estado y su función para manejar los cambios:

	const [markData, setMarkData] = useState({});

    const handleMark = (data) => {
        setMarkData({...data});
    };

5.- El contenido de MapContainer envuélvelo en un useMemo:

    const MapContent = useMemo(() => {
        return (
            <MapContainer center={[18.960336897236065, -99.225899768445]} zoom={12} scrollWheelZoom={true}
                          style={{height: "80%", width: "100%"}}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LeafletGeoSearch/>
                <MapConsumer>
                    {
                        (map) => OnEventClick(map, handleMark)
                    }
                </MapConsumer>
            </MapContainer>
        );
    }, []);

6.- El retorno del componente al final debe lucir así:

    return (
        <div style={{height: "100vh"}}>
            {MapContent}
            <div style={{
                margin: "0 1rem"
            }}>
                <h2>Dirección seleccionada: </h2>
                <h3>{markData?.name}</h3>
            </div>
        </div>
    );

7.- Listo, has agregado el mapa, un buscador, un marcador al dar clic y obtener los datos de este 
último.

### Enlaces que fueron de ayuda para realizar el presente ejemplo:
1.- Poner marcadores al dar clic sobre el mapa: https://codesandbox.io/s/4r7tc?file=/src/App.js:179-210

2.- Poner buscador: https://codesandbox.io/s/search-box-implementation-in-react-leaflet-v310-forked-ouezc?file=/src/MapWrapper.jsx

3.- Propiedades para el buscador: https://smeijer.github.io/leaflet-geosearch/leaflet-control


# My guide, How to use Leaflet on React with search input and marker onClick.

*Alert: Too much text xd.*

I decided to create this guide because, is confusing add a search input and a marker onClick in react leaflet map.
Leaflet react library has updated and with that the way to implement change too. The documentation from search input 
and marker not work properly.

While I was implementing, it wasn't work, so I searched on the web, and with solutions found I be able to complete the
requirement. So, now I make this example and guide with the steps in order to someone that have the same situation
can do it easily.

I really hope this simple guide help you. Also, if you have a better idea to improve this guide,
add new functionality or even improve or correct the grammar in english or spanish versions, don't doubt in 
make a pull request.

## Buy me a coffee xd
If you consider this example was helpful, and you want and have the possibility to support me, don't doubt 
to buy me a coffee: https://www.buymeacoffee.com/FelipeGH

## English

## <a href="https://feliipegh.github.io/ReactLeafletSearchAndMarker/" target='_blank” rel=”noreferrer noopener'>Demo</a>

## Section: Adding Map

In order to leaflet works, you need to do the following: 

From jlahd answer on GitHub: https://github.com/PaulLeCam/react-leaflet/issues/881

1- includes react-leaflet in babel transpilation, correctly processing the *??* operators

	npm add -D react-app-rewired react-app-rewire-babel-loader

	package json
	  "scripts": {
	    "start": "react-app-rewired start",
	    "build": "react-app-rewired build",
	    "test": "react-app-rewired test",
	    "eject": "react-scripts eject"
	}

2- Copy **config-overrides.js** file from example and paste to your project route.

3- Install leaflet: https://react-leaflet.js.org/docs/start-installation/

	npm install react react-dom leaflet

	npm install react-leaflet

### Note

You must import leaflet css styles, and set width and height to the map, otherwise map will not show.

import "leaflet/dist/leaflet.css";

    <MapContainer style={{height: "38rem", width:"100%"}} >...

4- Import the following:

    import {MapConsumer, MapContainer, TileLayer, useMap} from 'react-leaflet';

5- Add the map to your component as documentation shows: https://react-leaflet.js.org/docs/start-setup/

Having done that, the map is ready to use, without search input and location marker.

You can change the coordinates in order to show map center in them, to do that use Center props in MapContainer
component

## Section: Adding search input

1- In order to use search input, we need to use the following libraries:

	https://libraries.io/npm/leaflet-geosearch
	npm install leaflet-geosearch@3.5.0

	https://www.npmjs.com/package/leaflet-control-geocoder
	npm i leaflet-control-geocoder

2- Import the libraries installed in past step and L

	import L from "leaflet";
	import LCG from 'leaflet-control-geocoder';
	import {GeoSearchControl, OpenStreetMapProvider} from "leaflet-geosearch";

3- Import css from search:

	import "leaflet-geosearch/dist/geosearch.css";

4- In MapContainer make sure that TileLayer is the only child in this step

5- Add the following function to load the search:

	function LeafletGeoSearch() {
	    const map = useMap();
	    const provider = new OpenStreetMapProvider();
	    const searchControl = new GeoSearchControl({
	        provider,
	        showMarker: false,
	        searchLabel: "Buscar dirección",
	        style: "bar"
	    });
	    useEffect(() => {
	        map.addControl(searchControl);
	        return () => map.removeControl(searchControl);
	    });
	    return null;
	}

6- Add the previous function as child of MapContainer:

	<LeafletGeoSearch/>

With done this, the search now is ready to use, for more info check out the documentation, links added in step 1 from
this section.

## Section: Adding maker onClick in map.

### Note

In this section, the content of MapContainer will move using the hook *useMemo*. The reason of this, at saving the data
using *useState* component will render for each click, so marker function will request a lot of times and then leaflet
will block us for this.

1- Make sure to have all imports from previous step.

2- Add *constants.js* file from example project to yours, then import it as icon

    import icon from "./constants";

3- Add the following function:

	function OnEventClick(map, onMarked) {
	    const marker = useRef(null);

	    const onInit = () => {
	        LCG.L = L;
	        const geocoder = LCG.L.Control.Geocoder.nominatim();
	        map.on("click", function (e) {
	            const {lat, lng} = e.latlng;
	            if (marker.current !== null) {
	                map.removeLayer(marker.current);
	            }
	            marker.current = L.marker([lat, lng], {icon}).addTo(map);
	            geocoder.reverse(e.latlng, map.options.crs.scale(map.getZoom()), results => {
	                let r = results[0];
	                if (r) {
	                    marker.current.bindPopup(r?.name).openPopup();
	                    onMarked(r);
	                }
	            });
	        });
	    };

	    useEffect(onInit, [map, onMarked]);
	    return null;
	}

4- Create state and the function to handle changes.

	const [markData, setMarkData] = useState({});

    const handleMark = (data) => {
        setMarkData({...data});
    };

5- The content of MapContainer wrapped on useMemo hook.

    const MapContent = useMemo(() => {
        return (
            <MapContainer center={[18.960336897236065, -99.225899768445]} zoom={12} scrollWheelZoom={true}
                          style={{height: "80%", width: "100%"}}>
                <TileLayer
                    attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LeafletGeoSearch/>
                <MapConsumer>
                    {
                        (map) => OnEventClick(map, handleMark)
                    }
                </MapConsumer>
            </MapContainer>
        );
    }, []);

6- At the end, the component return should look like following:

    return (
        <div style={{height: "100vh"}}>
            {MapContent}
            <div style={{
                margin: "0 1rem"
            }}>
                <h2>Dirección seleccionada: </h2>
                <h3>{markData?.name}</h3>
            </div>
        </div>
    );

7- Congratulations, you have completed this guide, you have added a map, a search input 
and a marker obtaining its data.

### Link's that were useful to make this example:

1- Add onClick on MapContainer: https://codesandbox.io/s/4r7tc?file=/src/App.js:179-210

2- Search input implementation: https://codesandbox.io/s/search-box-implementation-in-react-leaflet-v310-forked-ouezc?file=/src/MapWrapper.jsx

3- Properties for search input: https://smeijer.github.io/leaflet-geosearch/leaflet-control