import React, { useState, useEffect } from 'react';
import { Rss, Loader } from 'lucide-react';

interface RssItem {
  title: string;
  link: string;
  pubDate: string;
}

// Contenu statique de secours
const FALLBACK_ITEMS: RssItem[] = [
  {
    title: "Actualités de l'aviation",
    link: "https://www.aeroweb-fr.net/",
    pubDate: new Date().toLocaleDateString()
  },
  {
    title: "Découvrir l'aéronautique",
    link: "https://www.aeroweb-fr.net/actualites",
    pubDate: new Date().toLocaleDateString()
  },
];

export function RssFeed() {
  const [items, setItems] = useState<RssItem[]>(FALLBACK_ITEMS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    const fetchRss = async () => {
      try {
        // Utiliser un proxy CORS pour éviter les problèmes de cross-origin
        const response = await fetch(
          'https://api.allorigins.win/get?' + 
          new URLSearchParams({
            url: 'https://www.aeroweb-fr.net/rss/tout.xml'
          }), 
          { 
            signal: controller.signal,
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!mounted) return;

        if (data.contents) {
          // Parser le XML manuellement
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(data.contents, "text/xml");
          const items = xmlDoc.querySelectorAll("item");
          
          const newItems = Array.from(items)
            .slice(0, 3)
            .map(item => ({
              title: item.querySelector("title")?.textContent || "",
              link: item.querySelector("link")?.textContent || "",
              pubDate: new Date(item.querySelector("pubDate")?.textContent || "").toLocaleDateString('fr-FR')
            }));

          if (newItems.length > 0) {
            setItems(newItems);
          }
        }
      } catch (err) {
        // En cas d'erreur, on garde silencieusement le contenu statique
        console.error('RSS feed error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Ajouter un délai avant de charger le flux RSS
    const timeoutId = setTimeout(() => {
      fetchRss();
    }, 1000);

    return () => {
      mounted = false;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-center mb-4">
        <Rss className="h-5 w-5 text-gray-400 mr-2" />
        <h3 className="text-sm font-medium text-gray-500">Actualités Aéronautiques</h3>
      </div>
      <div className="flex justify-center items-center space-x-4">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="text-gray-300">•</span>}
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-600"
            >
              <span className="text-xs text-gray-400">{item.pubDate}</span>
              <p className="inline ml-2">{item.title}</p>
            </a>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
