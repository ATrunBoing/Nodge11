# Analysebericht

## Zusammenfassung

Die Codebasis dient zur Visualisierung eines Netzwerks von Knoten und Kanten in einer 3D-Szene mit Three.js. Es gibt jedoch Probleme mit der Genauigkeit des Raycastings, insbesondere beim Hovern von Kanten.

## Probleme

*   **Ungenaues Raycasting:** Das Hovern von Kanten ist ungenau, besonders wenn sich der Mauszeiger nicht direkt zwischen den Knoten befindet. Das Hovern von Knoten funktioniert bei `mega.json` nicht zuverlässig.
*   **Falsche Positionierung des Info-Panels:** Das Info-Panel wurde nicht korrekt positioniert.
*   **Falsche Interaktion mit dem Info-Panel:** Das Info-Panel sollte beim Hovern angezeigt und durch einen Klick ausgefahren werden.

## Lösungsvorschläge

*   **Raycasting-Parameter anpassen:** Der `threshold`-Wert des Raycasters wurde erhöht, um die Erkennung von Kanten zu verbessern.
*   **Priorisierung von Nodes entfernen:** Die Priorisierung von Nodes gegenüber Edges in der `findIntersectedObject`-Methode wurde entfernt.
*   **Schatten für Kanten:** Die `Edge`-Klasse wurde angepasst, um Schatten zu werfen.
*   **Seitlicher Versatz für Kanten:** Die `Edge`-Klasse wurde angepasst, um einen seitlichen Versatz zu ermöglichen.
*   **Info-Panel:** Ein Info-Panel wurde implementiert, das beim Hovern über Knoten und Kanten angezeigt wird, beim Klicken weitere Details anzeigt und nun korrekt rechts vom Mauszeiger erscheint.

## Weitere Schritte

*   Testen Sie die Änderungen mit verschiedenen Datensätzen, insbesondere mit `mega.json`, um sicherzustellen, dass das Hovern zuverlässig funktioniert.
*   Untersuchen Sie alternative Methoden zur Erkennung von Kanten, z. B. durch die Berechnung des Abstands zwischen dem Mauszeiger und der Kante.
*   Überprüfen Sie die Codebasis auf überflüssigen Code und Verbesserungsmöglichkeiten.
