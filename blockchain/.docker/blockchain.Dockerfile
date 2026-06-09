FROM ghcr.io/foundry-rs/foundry

ENV ANVIL_IP_ADDR=0.0.0.0

USER root
WORKDIR /app

COPY blockchain .

RUN forge soldeer install

EXPOSE 8545

COPY blockchain/.docker/entrypoint.sh /
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
