package dispatcher;

import "net/http"
import "regexp"

type handlerMap map[* regexp.Regexp] http.Handler;

type Dispatcher struct {
  hm handlerMap;
};

func (d *Dispatcher) RegisterExpr(expr string, handler http.Handler) {
  d.hm[regexp.MustCompile(expr)] = handler;
}

func (d Dispatcher) ServeHTTP(wr http.ResponseWriter, req *http.Request) {
  /* var m handlerMap; */
  /* m  = make(handlerMap); */

  /* m[regexp.MustCompile("^/$")] = mainHandle;
  m[regexp.MustCompile("^/res")] = mainHandle; */

  for k, v := range d.hm {
    if k.MatchString(req.RequestURI) {
      v.ServeHTTP(wr, req);
      return;
    }
  }

  http.NotFound(wr, req);
}

func NewDispatcher() *Dispatcher {

  return &Dispatcher{make(handlerMap)};
}

