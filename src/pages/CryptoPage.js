import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import ChartSection from "../components/ChartSection";
import Converter from "../components/Converter";
import ConversionTable from "../components/ConversionTable";
import EducationalSection from "../components/EducationalSection";
import FAQ from "../components/FAQ";
import { fetchMappedTrends } from "../utils/trends";

const CryptoPage = () => {
  const { moeda } = useParams(); // Captura o parâmetro da URL
  const [priceBRL, setPriceBRL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [icon, setIcon] = useState("");
  const [error, setError] = useState(null);
  const [trendingCryptos, setTrendingCryptos] = useState([]);

  /**
   * Função para buscar e mapear tendências com criptomoedas reais.
   */
  const fetchAndMapTrends = async () => {
    try {
      const trends = await fetchMappedTrends();
      setTrendingCryptos(trends); // Atualiza o estado com os dados das tendências mapeadas
    } catch (error) {
      console.error("Erro ao buscar tendências mapeadas:", error.message);
    }
  };

  /**
   * Função para buscar o preço atual de uma criptomoeda.
   */
  const fetchPriceData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Faz a requisição ao backend
      const priceResponse = await axios.get(
        `http://localhost:5014/api/coin-price?symbol=${moeda}`
      );

      if (!priceResponse.data || !priceResponse.data.price) {
        throw new Error("Preço não encontrado.");
      }

      setPriceBRL(priceResponse.data.price); // Atualiza o preço em BRL
      setIcon(priceResponse.data.icon || `https://www.binance.com/favicon.ico`); // Ícone dinâmico ou padrão

      // Atualiza as meta tags para SEO
      document.title = `Cotação do ${moeda.toUpperCase()} Hoje: R$ ${priceResponse.data.price} | Acompanhe em Tempo Real`;
      const metaDescription = document.querySelector("meta[name='description']");
      if (metaDescription) {
        metaDescription.content = `Veja a cotação do ${moeda.toUpperCase()} hoje em tempo real: R$ ${priceResponse.data.price}.`;
      }
    } catch (error) {
      console.error("Erro ao buscar dados da moeda:", error.message);
      setError(
        `A moeda "${moeda}" não foi encontrada ou os dados estão indisponíveis no momento.`
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Efeito para buscar o preço da moeda quando o parâmetro da URL mudar.
   */
  useEffect(() => {
    if (!moeda) return;
    fetchPriceData();
  }, [moeda]);

  /**
   * Efeito para carregar tendências ao montar o componente.
   */
  useEffect(() => {
    fetchAndMapTrends();
  }, []);

  /**
   * Configuração de Schema.org para SEO avançado.
   */
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "FinancialService",
    name: `${moeda.toUpperCase()} Hoje`,
    url: `https://www.cotacaohoje.site/cotacao/${moeda.toLowerCase()}`,
    description: `Veja a cotação do ${moeda.toUpperCase()} hoje em tempo real e descubra o valor atualizado em reais (BRL).`,
    logo: icon,
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: priceBRL,
      availability: "https://schema.org/InStock",
      url: `https://www.cotacaohoje.site/comprar/${moeda.toLowerCase()}`,
    },
  };

  /**
   * Exibe mensagem de carregamento ou erro, caso necessário.
   */
  if (loading) {
    return <p style={{ textAlign: "center" }}>Carregando dados...</p>;
  }

  if (error) {
    return (
      <p style={{ textAlign: "center", color: "red", fontWeight: "bold" }}>
        {error}
      </p>
    );
  }

  /**
   * Renderiza a página completa da criptomoeda e as tendências.
   */
  return (
    <>
      <script type="application/ld+json">{JSON.stringify(schemaMarkup)}</script>
      <Header moeda={moeda} />
      <Hero moeda={moeda} />
      <ChartSection moeda={moeda} />
      <Converter moeda={moeda} price={priceBRL} />
      <ConversionTable moeda={moeda} price={priceBRL} />
      <EducationalSection moeda={moeda} />
      <FAQ moeda={moeda} />
      <Footer moeda={moeda} />

      {/* Seção para exibir tendências mapeadas */}
      <section style={{ padding: "20px", backgroundColor: "#f9f9f9" }}>
        <h2 style={{ textAlign: "center", color: "#333" }}>
          Tendências Mapeadas para Criptomoedas
        </h2>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {trendingCryptos.length > 0 ? (
            trendingCryptos.map((crypto, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  marginBottom: "10px",
                  backgroundColor: "#fff",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                }}
              >
                <h3>{crypto.trend}</h3>
                <p>
                  Criptomoeda: {crypto.coin.name.toUpperCase()} (
                  {crypto.coin.symbol.toUpperCase()})
                </p>
                <p>Preço Atual: R$ {crypto.price || "Indisponível"}</p>
                <p>Fonte: {crypto.source}</p>
                <p>
                  <a href={crypto.url} style={{ color: "#2563eb" }}>
                    Acessar página
                  </a>
                </p>
              </div>
            ))
          ) : (
            <p style={{ textAlign: "center", color: "#777" }}>
              Nenhuma tendência mapeada no momento.
            </p>
          )}
        </div>
      </section>
    </>
  );
};

export default CryptoPage;
