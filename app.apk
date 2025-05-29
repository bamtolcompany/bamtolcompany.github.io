import sys
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtCore import QUrl
from PyQt5.QtWebEngineWidgets import QWebEngineView

class WebViewApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("올인원 검색 공식 앱")

        self.webview = QWebEngineView(self)
        self.setCentralWidget(self.webview)

        self.webview.load(QUrl("https://bamtolcompany.github.io/"))
        self.webview.page().setLinkDelegationPolicy(self.webview.page().DelegateAllLinks)
        self.webview.page().linkClicked.connect(self.open_link)

    def open_link(self, url):
        self.webview.load(url)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = WebViewApp()
    window.show()
    sys.exit(app.exec_())
