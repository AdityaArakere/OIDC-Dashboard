# Grab the .NET Core build environment docker image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build-env
 
# These aruguments should be passed in from the build
ARG CommitSha="00000"
ARG BuildNumber=1
 
 
WORKDIR /app
 
 
# Copy everything else from build context to the image
COPY . ./
 
 
# copy csproj and restore as distinct layers. This improves the docker build time since it can use cached images
# See reference https://stackoverflow.com/questions/51372791/is-there-a-more-elegant-way-to-copy-specific-files-using-docker-copy-to-the-work
COPY *.sln .
COPY .nuget/NuGet.config ./.nuget/NuGet.config
 
RUN dotnet restore --configfile ./.nuget/NuGet.config
 
# Compile the code and place it in an out directory
RUN dotnet publish --no-restore -c Release -o ./out /p:FileVersion=${BuildNumber}-${CommitSha}
 
# Grab the .NET Core runtime environment docker image
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
 
# Install the agent
RUN apt-get update && apt-get install -y wget ca-certificates gnupg \
&& echo 'deb http://apt.newrelic.com/debian/ newrelic non-free' | tee /etc/apt/sources.list.d/newrelic.list \
&& wget https://download.newrelic.com/548C16BF.gpg \
&& apt-key add 548C16BF.gpg \
&& apt-get update \
&& apt-get install -y newrelic-dotnet-agent \
&& rm -rf /var/lib/apt/lists/*
 
 
# Enable the agent
ENV CORECLR_ENABLE_PROFILING=1 \
NEW_RELIC_DISTRIBUTED_TRACING_ENABLED=true \
CORECLR_PROFILER={36032161-FFC0-4B61-B559-F6C5D41BAE5A} \
CORECLR_NEWRELIC_HOME=/usr/local/newrelic-dotnet-agent \
CORECLR_PROFILER_PATH=/usr/local/newrelic-dotnet-agent/libNewRelicProfiler.so
 
# Copy compiled files to runtime image
COPY --from=build-env /app/out ./
ENTRYPOINT ["dotnet", "WebApplication3.dll"]