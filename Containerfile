FROM gcr.io/distroless/static-debian12:nonroot@sha256:f5b485ea962d9bd1186b2f6b3a061191539b905b82ec395de78cbfae51f20e35

LABEL org.opencontainers.image.title="repo-operations"
LABEL org.opencontainers.image.description="https://www.youtube.com/watch?v=dQw4w9WgXcQ"

HEALTHCHECK NONE

USER nonroot:nonroot
