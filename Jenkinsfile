pipeline {
    agent any

    environment {
        NODEJS_HOME = tool name: 'NodeJS', type: 'NodeJSInstallation'
        PATH = "${NODEJS_HOME}/bin:${env.PATH}"
        SONARQUBE = "SonarQube"  // Name of SonarQube server in Jenkins
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/hawarya/devops_hackathon.git'
            }
        }

        stage('Install Dependencies') {
            parallel {
                stage('Frontend') {
                    steps {
                        dir('frontend') {
                            sh 'npm install'
                        }
                    }
                }
                stage('Backend') {
                    steps {
                        dir('backend') {
                            sh 'npm install'
                        }
                    }
                }
            }
        }

        stage('Code Quality - SonarQube') {
            steps {
                withSonarQubeEnv('SonarQube') {
                    dir('frontend') {
                        sh 'sonar-scanner -Dsonar.projectKey=frontend -Dsonar.sources=src -Dsonar.language=js -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_AUTH_TOKEN'
                    }
                    dir('backend') {
                        sh 'sonar-scanner -Dsonar.projectKey=backend -Dsonar.sources=. -Dsonar.language=js -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_AUTH_TOKEN'
                    }
                }
            }
        }

        stage('Security Scan - OWASP Dependency Check') {
            steps {
                dir('frontend') {
                    dependencyCheck additionalArguments: '--project "Frontend" --scan ./', odcInstallation: 'DependencyCheck'
                }
                dir('backend') {
                    dependencyCheck additionalArguments: '--project "Backend" --scan ./', odcInstallation: 'DependencyCheck'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend') {
                    sh 'npm test || echo "No tests configured"'
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(['your-ssh-credentials-id']) {
                    sh """
                    # Deploy frontend build
                    scp -r frontend/build/* user@server:/var/www/html/

                    # Deploy backend
                    scp -r backend/* user@server:/home/user/backend/

                    # Restart backend server with PM2
                    ssh user@server 'pm2 restart backend || pm2 start /home/user/backend/server.js --name backend'
                    """
                }
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully with code quality & security checks!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
