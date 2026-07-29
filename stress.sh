#!/bin/bash
SHORTCODE=$1
N=${2:-100}

if [ -z "$SHORTCODE" ]; then
  echo "Uso: bash stress.sh SEUCODE [quantidade]"
  exit 1
fi

echo "Disparando $N requisições pro shortCode: $SHORTCODE"

START=$(date +%s)

for i in $(seq 1 "$N"); do
  curl -s -o /dev/null http://localhost:3000/$SHORTCODE
done

END=$(date +%s)
DURATION=$((END - START))

STATS=$(curl -s http://localhost:3000/stats)
TTL=$(echo "$STATS" | grep -o '"cacheTtlSegundos":[0-9]*' | grep -o '[0-9]*')

echo ""
echo "===== Resultado ====="
echo "Tempo total do teste: ${DURATION}s"
echo "TTL do cache: ${TTL}s"

if [ -n "$TTL" ] && [ "$DURATION" -lt "$TTL" ]; then
  echo "-> Teste inteiro rodou DENTRO da janela de expiração do cache (${DURATION}s < ${TTL}s)."
  echo "-> Ou seja: era esperado só 1 consulta ao MySQL, o resto veio do Redis."
else
  echo "-> Teste ultrapassou o TTL do cache (${DURATION}s >= ${TTL}s)."
  echo "-> Pode ter havido mais de 1 consulta ao MySQL, pois o cache expirou no meio do teste."
fi

echo ""
echo "Estatísticas (/stats):"
echo "$STATS"
echo ""
